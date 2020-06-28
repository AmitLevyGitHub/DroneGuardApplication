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
      setWorkStatus("Creating directory on device");
      const dirName = `${FN.eventPrefix}_s_${event.startTime}`;
      const dirPath = `${RNFS.ExternalDirectoryPath}/${dirName}`;
      try {
        await RNFS.mkdir(dirPath);
        event.directoryPath = dirPath;
        event.directoryName = dirName;
        logger("DEV", dirPath, caller, step);
      } catch (e) {
        setWorkStatus("Error creating directory on device");
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
      setWorkStatus("Creating event in database");
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
        setWorkStatus("Error creating event in database");
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
        setWorkStatus("Trimming video");
        const srcVideoPath = RNFS.ExternalDirectoryPath + "/" + FN.video;
        const eventVideoName = `${FN.eventPrefix}_s${event.startTime}.mp4`;
        const eventVideoPath = event.directoryPath + "/" + eventVideoName;
        const sTime = parseInt((event.startTime - ZERO_time) / 1000);
        // const eTime =
        //   parseInt((event.endTime - event.startTime) / 1000) + sTime;
        // const endTimeStr = new Date(eTime * 1000).toISOString().substr(11, 8);
        // const FFMPEGcommand = `-i ${srcVideoPath} -vf trim=${sTime}:${eTime} ${eventVideoPath}`;
        let duration = parseInt(
          (event.endTime - event.startTime - 1000) / 1000
        );
        if (duration <= 0) duration = 1;
        const durationStr = new Date(duration * 1000)
          .toISOString()
          .substr(11, 8);
        const startTimeStr = new Date(sTime * 1000).toISOString().substr(11, 8);
        const FFMPEGcommand = `-ss ${startTimeStr} -i ${srcVideoPath} -to ${durationStr} -c:v copy ${eventVideoPath}`;
        logger("DEV", FFMPEGcommand, caller, step);
        await RNFFmpeg.execute(FFMPEGcommand);
        logger("DEV", eventVideoPath, caller, step);
        event.video.fileName = eventVideoName;
        event.video.fullPath = eventVideoPath;
      } catch (e) {
        setWorkStatus("Error trimming video");
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
      setWorkStatus("Uploading video to S3 bucket");
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
        setWorkStatus("Error uploading video to S3 bucket");
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
      setWorkStatus("Updating video URL in database");
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
        setWorkStatus("Error updating video URL in database");
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
        setWorkStatus("Creating video thumbnail");
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
        setWorkStatus("Error creating video thumbnail");
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
      setWorkStatus("Uploading thumbnail to S3 bucket");
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
        setWorkStatus("Error uploading thumbnail to S3 bucket");
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
      setWorkStatus("Updating thumbnail URL in database");
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
        setWorkStatus("Error updating thumbnail URL in database");
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
        setWorkStatus("Trimming telemetry");
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
        logger("DUMMY", `tele count = ${ALLtelemetry.length}`, caller, step);
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
        setWorkStatus("Error trimming telemetry");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error trimming telemetry: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 4.1 upload telemetry
     */
    if (!event.telemetry.awsURL) {
      step = "uploadTelemetry";
      setWorkStatus("Uploading telemetry");
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
        setWorkStatus("Error uploading telemetry");
        const eStr = e.hasOwnProperty("text") ? e.text : e;
        const m = `error uploading telemetry: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 4.2 update telemetry URL in database
     */
    if (!event.telemetry.updatedDB) {
      step = "updateTelemetryURL";
      setWorkStatus("Updating telemetry URL in database");
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
        setWorkStatus("Error updating telemetry URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating telemetry URL in database: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 5.0 trim logger operations
     */
    if (!event.logger.fullPath) {
      step = "trimLoggerOperations";
      try {
        setWorkStatus("Trimming logger");
        //
        // const srcLoggerFile =
        //   RNFS.ExternalDirectoryPath + "/" + FN.logger;
        const srcLoggerFile =
          RNFS.ExternalDirectoryPath + "/" + "loggerOperations.txt";
        let ALL_logger = null;
        let dataRead = "";
        logger("DEV", `RNFS.readFile(${srcLoggerFile})`, caller, step);
        dataRead = await RNFS.readFile(srcLoggerFile);
        dataRead = dataRead.substring(0, dataRead.length - 1);
        dataRead = "[" + dataRead + "]";
        ALL_logger = JSON.parse(dataRead);
        logger("DUMMY", `logger count = ${ALL_logger.length}`, caller, step);
        //
        let cutLogger = "";
        console.log(
          `eventStartTime = ${event.startTime}  --  eventEndTime = ${event.endTime}`
        );
        for (let i = 0; i < ALL_logger.length; i++) {
          if (
            ALL_logger[i].level == "OPERATION" &&
            ALL_logger[i].time >= event.startTime &&
            ALL_logger[i].time <= event.endTime
          ) {
            cutLogger += JSON.stringify(ALL_logger[i]);
            cutLogger += ",";
          }
        }
        cutLogger = cutLogger.substring(0, cutLogger.length - 1);
        cutLogger = "[" + cutLogger + "]";
        //
        const eventLoggerName = `${FN.eventPrefix}Logger_s${event.startTime}.json`;
        const eventLoggerPath = event.directoryPath + "/" + eventLoggerName;
        logger("DEV", `RNFS.writeFile(${eventLoggerPath}, )`, caller, step);
        await RNFS.writeFile(eventLoggerPath, cutLogger);
        event.logger.fileName = eventLoggerName;
        event.logger.fullPath = eventLoggerPath;
      } catch (e) {
        setWorkStatus("Error trimming logger operations");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error trimming logger operations: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 5.1 upload logger operations
     */
    if (!event.logger.awsURL) {
      step = "uploadLoggerOperations";
      setWorkStatus("Uploading logger operations");
      const file = {
        uri: `file://${event.logger.fullPath}`,
        name: event.logger.fileName,
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
          event.logger.awsURL = res.body.postResponse.location;
          logger("DEV", res.body.postResponse.location, caller, step);
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        setWorkStatus("Error uploading logger operations");
        const eStr = e.hasOwnProperty("text") ? e.text : e;
        const m = `error uploading logger operations: ${eStr}`;
        logger("ERROR", eStr, caller, step);
        await updateAsyncStorage(allEvents, event);
        return reject(m);
      }
      await updateAsyncStorage(allEvents, event);
    }
    /**
     * 5.2 update logger operations URL in database
     */
    if (!event.logger.updatedDB) {
      step = "updateLoggerOperationsURL";
      setWorkStatus("Updating logger operations URL in database");
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
              loggerURL: event.logger.awsURL,
            }),
          }
        );
        if (response.status === 200) {
          event.logger.updatedDB = true;
          logger("DEV", "logger operations URL updated in DB", caller, step);
        } else {
          throw new Error(`status code = ${response.status}`);
        }
      } catch (e) {
        setWorkStatus("Error updating logger operations URL in database");
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        const m = `error updating logger operations  URL in database: ${eStr}`;
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
