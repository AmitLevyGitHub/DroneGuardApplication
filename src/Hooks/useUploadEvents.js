import React from "react";
import AsyncStorage from "@react-native-community/async-storage";
import RNFS from "react-native-fs";
import { RNFFmpeg } from "react-native-ffmpeg";
import { RNS3 } from "react-native-aws3";
import { AWSkeys } from "../Assets/secrets";
import { AS, FN } from "../Assets/consts";
// const thumbnailPos = "00:00:03";
const thumbnailPos = "00:00:00";
//
export default function useUploadEvents(
  isPreparing,
  handleEvents,
  eventsStatus,
  videoStat,
  tokenIDs
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
        console.log(
          `handling emergency event number: ${i} with start time = ${event.startTime}`
        );
        setCurrentEvent(event);
        if (event.failed) {
          console.log(`event number ${i} failed, skipping`);
          continue;
        }
        //
        try {
          await handleEvent(
            eventsStatus,
            videoStat,
            event,
            setWorkStatus,
            tokenIDs
          );
        } catch (error) {
          isError = true;
          event.failed = true;
          const newFailedEvents = failedEvents.map((failedEvent) => ({
            ...failedEvent,
          }));
          newFailedEvents.push({ index: event.index, status: error });
          setFailedEvents(newFailedEvents);
          //show message for few more seconds?
        }
        console.log(
          `finished handling emergency event number: ${i} with start time = ${event.startTime}`
        );
      }
      //
      if (!isError) {
        console.log("finished handling all events without errors");
        setLoopFinished(true);
      } else {
        console.log("finished handling all events with errors");
        setLoopFinished(true);
      }
    })();
  }, [isPreparing, handleEvents, eventsStatus, videoStat, tokenIDs]);
  //
  return [currentEvent, workStatus, loopFinished, failedEvents];
}
async function handleEventFake() {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await sleep(5000);
}
function handleEvent(allEvents, videoStat, event, setWorkStatus, tokenIDs) {
  return new Promise(async (resolve, reject) => {
    // const beachId = "5ea2d21477f48e08a8e19e4e";
    // const lifeGuardId = "5ed6239e9f40dd001719c3ec";
    const beachId = tokenIDs.beachId;
    const lifeGuardId = tokenIDs.lifeGuardId;
    const token = tokenIDs.token;
    /**
     * create folder on device
     */
    if (!event.directoryPath) {
      setWorkStatus("creating directory on device");
      const dirName = `${FN.eventPrefix}_s_${event.startTime}`;
      const dirPath = `${RNFS.ExternalDirectoryPath}/${dirName}`;
      try {
        await RNFS.mkdir(dirPath);
        event.directoryPath = dirPath;
        event.directoryName = dirName;
      } catch (e) {
        setWorkStatus("error creating directory on device");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error creating directory on device: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * create event in DB
     */
    if (!event.ID) {
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
          console.log(
            `event created in database with ID = ${addEventResponse._id}`
          );
          event.ID = addEventResponse._id;
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error creating event in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error creating event in database: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * trim video
     */
    if (!event.video.fullPath) {
      try {
        setWorkStatus("trimming video");
        const srcVideoPath = RNFS.ExternalDirectoryPath + "/" + FN.video;
        const eventVideoName = `${FN.eventPrefix}_s${event.startTime}.mp4`;
        const eventVideoPath = event.directoryPath + "/" + eventVideoName;
        console.log(`videoStat.startTime = ${videoStat.startTime}`);
        const sTime = parseInt((event.startTime - videoStat.startTime) / 1000);
        const eTime = parseInt((event.endTime - event.startTime) / 1000);
        const FFMPEGcommand = `-i ${srcVideoPath} -vf trim=${sTime}:${eTime} ${eventVideoPath}`;
        console.log(`trimming video and saving it to ${eventVideoPath}`);
        console.log(`executing FFMPEG command: ${FFMPEGcommand}`);
        await RNFFmpeg.execute(FFMPEGcommand);
        event.video.fileName = eventVideoName;
        event.video.fullPath = eventVideoPath;
      } catch (e) {
        setWorkStatus("error trimming video");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error trimming video: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * upload video
     */
    if (!event.video.awsURL) {
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
          console.log("response from successful upload to s3:", res.body);
          console.log("S3 URL", res.body.postResponse.location);
          event.video.awsURL = res.body.postResponse.location;
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        setWorkStatus("error uploading video");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error uploading video: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * update video URL in database
     */
    if (!event.video.updatedDB) {
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
          console.log(`successfully updated event video url`);
          event.video.updatedDB = true;
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error updating video URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating video URL in database: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * create thumbnail
     */
    if (!event.thumbnail.fullPath) {
      try {
        setWorkStatus("creating thumbnail");
        const srcVideoPath = event.video.fullPath;
        const eventThumbnailName = `${FN.eventPrefix}_s${event.startTime}.jpeg`;
        const eventThumbnailPath =
          event.directoryPath + "/" + eventThumbnailName;

        const FFMPEGcommand = `-ss ${thumbnailPos} -i ${srcVideoPath} -vframes 1 -q:v 2 ${eventThumbnailPath}`;
        console.log(
          `creating thumbnail and saving it to ${eventThumbnailPath}`
        );
        console.log(`executing FFMPEG command: ${FFMPEGcommand}`);
        await RNFFmpeg.execute(FFMPEGcommand);
        event.thumbnail.fileName = eventThumbnailName;
        event.thumbnail.fullPath = eventThumbnailPath;
      } catch (e) {
        setWorkStatus("error creating thumbnail");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error creating thumbnail: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * upload thumbnail
     */
    if (!event.thumbnail.awsURL) {
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
          console.log("response from successful upload to s3:", res.body);
          console.log("S3 URL", res.body.postResponse.location);
          event.thumbnail.awsURL = res.body.postResponse.location;
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        setWorkStatus("error uploading thumbnail");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error uploading thumbnail: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * update thumbnail URL in database
     */
    if (!event.thumbnail.updatedDB) {
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
          console.log(`successfully updated event thumbnail url`);
          event.thumbnail.updatedDB = true;
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error updating thumbnail URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating thumbnail URL in database: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * trim telemetry
     */
    if (!event.telemetry.fullPath) {
      try {
        setWorkStatus("trimming telemetry");
        //
        const srcTelemetryPath =
          RNFS.ExternalDirectoryPath + "/" + FN.telemetry;
        let ALLtelemetry = null;
        let dataRead = "";
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
        await RNFS.writeFile(eventTelemetryPath, cutTele);
        event.telemetry.fileName = eventTelemetryName;
        event.telemetry.fullPath = eventTelemetryPath;
      } catch (e) {
        setWorkStatus("error trimming telemetry");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error trimming telemetry: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * upload telemetry
     */
    if (!event.telemetry.awsURL) {
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
          console.log("response from successful upload to s3:", res.body);
          console.log("S3 URL", res.body.postResponse.location);
          event.telemetry.awsURL = res.body.postResponse.location;
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        setWorkStatus("error uploading telemetry");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error uploading telemetry: ${eStr}`;
        console.log(m);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * update telemetry URL in database
     */
    if (!event.telemetry.updatedDB) {
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
          console.log(`successfully updated event telemetry url`);
          event.telemetry.updatedDB = true;
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("error updating telemetry URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating telemetry URL in database: ${eStr}`;
        console.log(m);
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
