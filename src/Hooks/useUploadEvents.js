import React from "react";
import AsyncStorage from "@react-native-community/async-storage";
import RNFS from "react-native-fs";
import { RNFFmpeg } from "react-native-ffmpeg";
import { RNS3 } from "react-native-aws3";
import { AWSkeys } from "../Assets/secrets";
import { AS, FN } from "../Assets/consts";
import logger from "../logger";
// const thumbnailPos = "00:00:03";
const thumbnailPos = "00:00:00";
const caller = "useUploadEvents.js";
//
export default function useUploadEvents(
  isPreparing,
  handleEvents,
  eventsStatus,
  videoStat,
  tokenIDs,
  firstTeleTime
) {
  const [currentEvent, setCurrentEvent] = React.useState({ index: -1 });
  const [workStatus, setWorkStatus] = React.useState("creating directory");
  const [failedEvents, setFailedEvents] = React.useState([]);
  const [loopFinished, setLoopFinished] = React.useState(false);
  React.useEffect(() => {
    if (isPreparing) return;
    if (!handleEvents) return;
    (async () => {
      let isError = false;
      for (let i = 0; i < eventsStatus.length; i++) {
        const event = eventsStatus[i];
        setCurrentEvent(event);
        if (event.status === "failed") {
          logger(
            "DEV",
            `event number ${i + 1} failed before, skipping`,
            caller
          );
          continue;
        }
        logger(
          "DEV",
          `handling emergency event number: ${i + 1} with start time = ${
            event.startTime
          }`,
          caller
        );
        //
        try {
          event.status = "working";
          await handleEvent(
            eventsStatus,
            videoStat,
            event,
            setWorkStatus,
            tokenIDs,
            firstTeleTime
          );
          event.status = "done";
          logger(
            "DEV",
            `finished handling emergency event number: ${i +
              1} with start time = ${event.startTime}`,
            caller
          );
        } catch (error) {
          isError = true;
          event.status = "failed";
          const newFailedEvents = failedEvents.map((failedEvent) => ({
            ...failedEvent,
          }));
          newFailedEvents.push({ index: event.index, status: error });
          setFailedEvents(newFailedEvents);
          logger(
            "ERROR",
            `finished handling emergency event number: ${i +
              1} with start time = ${event.startTime}`,
            caller
          );
          //show message for few more seconds?
        }
      }
      //
      if (!isError) {
        logger("DEV", "finished handling all events without errors", caller);
        setLoopFinished(true);
      } else {
        logger("ERROR", "finished handling all events with errors", caller);
        setLoopFinished(true);
      }
    })();
  }, [
    isPreparing,
    handleEvents,
    eventsStatus,
    videoStat,
    tokenIDs,
    firstTeleTime,
  ]);
  //
  return [currentEvent, workStatus, loopFinished, failedEvents];
}
async function handleEventFake() {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await sleep(5000);
}
function handleEvent(
  allEvents,
  videoStat,
  event,
  setWorkStatus,
  tokenIDs,
  firstTeleTime
) {
  return new Promise(async (resolve, reject) => {
    let step = null;
    const beachId = tokenIDs.beachId;
    const lifeGuardId = tokenIDs.lifeGuardId;
    const token = tokenIDs.token;
    // const ZERO_time = videoStat.startTime;
    const ZERO_time = firstTeleTime;
    /**
     * 0.0 create folder on device
     */
    if (!event.directoryPath) {
      step = "createDirectory";
      setWorkStatus("creating directory on device");
      const dirName = `${FN.eventPrefix}_s_${event.startTime}`;
      const dirPath = `${RNFS.ExternalDirectoryPath}/${dirName}`;
      try {
        await RNFS.mkdir(dirPath);
        event.directoryPath = dirPath;
        event.directoryName = dirName;
        logger("DEV", dirPath, caller, step);
      } catch (e) {
        setWorkStatus("error creating directory on device");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error creating directory on device: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 1.0 create event in DB
     */
    if (!event.ID) {
      step = "createEventInDB";
      setWorkStatus("creating event in database");
      try {
        let response = await fetch(
          "https://drone-guard-debriefing-server.herokuapp.com/addEvent",
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              startTime: event.startTime,
              endTime: event.endTime,
              lifeGuardId,
              beachId,
            }),
          }
        );
        if (response.status === 200) {
          const addEventResponse = await response.json();
          event.ID = addEventResponse._id;
          logger("DEV", addEventResponse._id, caller, step);
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error creating event in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error creating event in database: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 2.0 trim video
     */
    if (!event.video.fullPath) {
      step = "trimVideo";
      try {
        setWorkStatus("trimming video");
        const srcVideoPath = RNFS.ExternalDirectoryPath + "/" + FN.video;
        const eventVideoName = `${FN.eventPrefix}_s${event.startTime}.mp4`;
        const eventVideoPath = event.directoryPath + "/" + eventVideoName;
        const sTime = parseInt((event.startTime - ZERO_time) / 1000);
        const eTime =
          parseInt((event.endTime - event.startTime) / 1000) + sTime;
        const FFMPEGcommand = `-i ${srcVideoPath} -vf trim=${sTime}:${eTime} ${eventVideoPath}`;
        logger("DEV", FFMPEGcommand, caller, step);
        await RNFFmpeg.execute(FFMPEGcommand);
        logger("DEV", eventVideoPath, caller, step);
        event.video.fileName = eventVideoName;
        event.video.fullPath = eventVideoPath;
      } catch (e) {
        setWorkStatus("error trimming video");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error trimming video: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 2.1 upload video
     */
    if (!event.video.awsURL) {
      step = "uploadVideo";
      setWorkStatus("uploading video");
      const file = {
        uri: `file://${event.video.fullPath}`,
        name: event.video.fileName,
        type: "video/mp4",
      };
      const options = {
        keyPrefix: `${event.directoryName}/`,
        bucket: "drone-guard-videos",
        region: "eu-west-1",
        accessKey: AWSkeys.accessKey,
        secretKey: AWSkeys.secretKey,
        successActionStatus: 201,
      };
      try {
        const res = await RNS3.put(file, options);
        if (res.status === 201) {
          event.video.awsURL = res.body.postResponse.location;
          logger("DEV", res.body.postResponse.location, caller, step);
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        setWorkStatus("error uploading video");
        const eStr = e.hasOwnProperty("text") ? e.text : e;
        const m = `error uploading video: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 2.2 update video URL in database
     */
    if (!event.video.updatedDB) {
      step = "updateVideoURL";
      setWorkStatus("updating video URL in database");
      try {
        let response = await fetch(
          "https://drone-guard-debriefing-server.herokuapp.com/updateEvent",
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              eventId: event.ID,
              videoUrl: event.video.awsURL,
            }),
          }
        );
        if (response.status === 200) {
          event.video.updatedDB = true;
          logger("DEV", "video URL updated in DB", caller, step);
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error updating video URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating video URL in database: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 3.0 create thumbnail
     */
    if (!event.thumbnail.fullPath) {
      step = "createThumbnail";
      try {
        setWorkStatus("creating thumbnail");
        const srcVideoPath = event.video.fullPath;
        const eventThumbnailName = `${FN.eventPrefix}_s${event.startTime}.jpeg`;
        const eventThumbnailPath =
          event.directoryPath + "/" + eventThumbnailName;
        const FFMPEGcommand = `-ss ${thumbnailPos} -i ${srcVideoPath} -vframes 1 -q:v 2 ${eventThumbnailPath}`;
        logger("DEV", FFMPEGcommand, caller, step);
        await RNFFmpeg.execute(FFMPEGcommand);
        logger("DEV", eventThumbnailPath, caller, step);
        event.thumbnail.fileName = eventThumbnailName;
        event.thumbnail.fullPath = eventThumbnailPath;
      } catch (e) {
        setWorkStatus("error creating thumbnail");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error creating thumbnail: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 3.1 upload thumbnail
     */
    if (!event.thumbnail.awsURL) {
      step = "uploadThumbnail";
      setWorkStatus("uploading thumbnail");
      const file = {
        uri: `file://${event.thumbnail.fullPath}`,
        name: event.thumbnail.fileName,
        type: "image/jpeg",
      };
      const options = {
        keyPrefix: `${event.directoryName}/`,
        bucket: "drone-guard-videos",
        region: "eu-west-1",
        accessKey: AWSkeys.accessKey,
        secretKey: AWSkeys.secretKey,
        successActionStatus: 201,
      };
      try {
        const res = await RNS3.put(file, options);
        if (res.status === 201) {
          event.thumbnail.awsURL = res.body.postResponse.location;
          logger("DEV", res.body.postResponse.location, caller, step);
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        setWorkStatus("error uploading thumbnail");
        const eStr = e.hasOwnProperty("text") ? e.text : e;
        const m = `error uploading thumbnail: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 3.2 update thumbnail URL in database
     */
    if (!event.thumbnail.updatedDB) {
      step = "updateThumbnailURL";
      setWorkStatus("updating thumbnail URL in database");
      try {
        let response = await fetch(
          "https://drone-guard-debriefing-server.herokuapp.com/updateEvent",
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              eventId: event.ID,
              thumbnailURL: event.thumbnail.awsURL,
            }),
          }
        );
        if (response.status === 200) {
          event.thumbnail.updatedDB = true;
          logger("DEV", "thumbnail URL updated in DB", caller, step);
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error updating thumbnail URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating thumbnail URL in database: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 4.0 trim telemetry
     */
    if (!event.telemetry.fullPath) {
      step = "trimTelemetry";
      try {
        setWorkStatus("trimming telemetry");
        //
        const srcTelemetryPath =
          RNFS.ExternalDirectoryPath + "/" + FN.telemetry;
        let ALLtelemetry = null;
        let dataRead = "";
        logger("DEV", `RNFS.readFile(${srcTelemetryPath})`, caller, step);
        dataRead = await RNFS.readFile(srcTelemetryPath);
        dataRead = dataRead.substring(0, dataRead.length - 1);
        dataRead = "[" + dataRead + "]";
        ALLtelemetry = JSON.parse(dataRead);
        console.log(`tele count = ${ALLtelemetry.length}`);
        //
        let cutTele = "";
        for (let i = 0; i < ALLtelemetry.length; i++) {
          if (
            ALLtelemetry[i].time >= event.startTime &&
            ALLtelemetry[i].time < event.endTime
          ) {
            cutTele += JSON.stringify(ALLtelemetry[i]);
            cutTele += ",";
          }
          if (ALLtelemetry[i].time > event.endTime) {
            break;
          }
        }
        cutTele = cutTele.substring(0, cutTele.length - 1);
        cutTele = "[" + cutTele + "]";
        //
        const eventTelemetryName = `${FN.eventPrefix}_s${event.startTime}.json`;
        const eventTelemetryPath =
          event.directoryPath + "/" + eventTelemetryName;
        logger("DEV", `RNFS.writeFile(${eventTelemetryPath}, )`, caller, step);
        await RNFS.writeFile(eventTelemetryPath, cutTele);
        event.telemetry.fileName = eventTelemetryName;
        event.telemetry.fullPath = eventTelemetryPath;
      } catch (e) {
        setWorkStatus("error trimming telemetry");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error trimming telemetry: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 3.1 upload telemetry
     */
    if (!event.telemetry.awsURL) {
      step = "uploadTelemetry";
      setWorkStatus("uploading telemetry");
      const file = {
        uri: `file://${event.telemetry.fullPath}`,
        name: event.telemetry.fileName,
        type: "application/json",
      };
      const options = {
        keyPrefix: `${event.directoryName}/`,
        bucket: "drone-guard-videos",
        region: "eu-west-1",
        accessKey: AWSkeys.accessKey,
        secretKey: AWSkeys.secretKey,
        successActionStatus: 201,
      };
      try {
        const res = await RNS3.put(file, options);
        if (res.status === 201) {
          event.telemetry.awsURL = res.body.postResponse.location;
          logger("DEV", res.body.postResponse.location, caller, step);
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        setWorkStatus("error uploading telemetry");
        const eStr = e.hasOwnProperty("text") ? e.text : e;
        const m = `error uploading telemetry: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 3.2 update telemetry URL in database
     */
    if (!event.telemetry.updatedDB) {
      step = "updateTelemetryURL";
      setWorkStatus("updating telemetry URL in database");
      try {
        let response = await fetch(
          "https://drone-guard-debriefing-server.herokuapp.com/updateEvent",
          {
            method: "POST",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
            body: JSON.stringify({
              eventId: event.ID,
              telemtryURL: event.telemetry.awsURL, //"telemtryURL" is a typo in DB schema- it is ok!
            }),
          }
        );
        if (response.status === 200) {
          event.telemetry.updatedDB = true;
          logger("DEV", "telemetry URL updated in DB", caller, step);
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error updating telemetry URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating telemetry URL in database: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * return
     */
    return resolve();
  });
}
function updateAsyncStorage(allEvents, event) {
  return new Promise(async (resolve, reject) => {
    try {
      await AsyncStorage.setItem(AS.uploadStatus, JSON.stringify(allEvents));
      return resolve();
    } catch (e) {
      // saving error
      console.log(`error setting AsyncStorage ${AS.uploadStatus}`);
      return reject();
    }
  });
}
