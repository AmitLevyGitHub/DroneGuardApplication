import React from "react";
import AsyncStorage from "@react-native-community/async-storage";
import RNFS from "react-native-fs";
import { RNFFprobe } from "react-native-ffmpeg";
import { RNS3 } from "react-native-aws3";
import { AWSkeys } from "../Assets/secrets";
import { AS, FN, navConsts } from "../Assets/consts";
import logger from "../logger";
const caller = "usePrepareUpload.js";
export default function usePrepareUpload(requirePrepare, userEvents) {
  const [isPreparing, setPreparing] = React.useState(true);
  const [prepError, setPrepError] = React.useState(null);
  const [eventsStatus, setEventsStatus] = React.useState([]);
  const [videoStat, setVideoStat] = React.useState(null);
  const [tokenIDs, setTokenIDs] = React.useState(null);
  const [firstTeleTime, setFirstTeleTime] = React.useState(0);
  const [loggerURL, setLoggerURL] = React.useState(null);
  React.useEffect(() => {
    let isSubscribed = true;
    (async () => {
      setPreparing(true);
      /**
       * get token/id/beachID from local storage
       */
      let token = null;
      try {
        token = await AsyncStorage.getItem(AS.userToken);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", m, caller, `AsyncStorage.getItem(${AS.userToken})`);
        setPrepError(m);
      }
      let lifeGuardId = null;
      try {
        lifeGuardId = await AsyncStorage.getItem(AS.lifeGuardId);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", m, caller, `AsyncStorage.getItem(${AS.lifeGuardId})`);
        setPrepError(m);
      }
      let beachId = null;
      try {
        beachId = await AsyncStorage.getItem(AS.beachId);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", m, caller, `AsyncStorage.getItem(${AS.beachId})`);
        setPrepError(m);
      }
      setTokenIDs({
        token,
        lifeGuardId,
        beachId,
      });
      /**
       * read video stat
       */
      const videoPath = RNFS.ExternalDirectoryPath + "/" + FN.video;
      let vidStartTime = -1,
        vidDuration = -1,
        vidStartTimeInFile = -1;
      try {
        const stat = await RNFS.stat(videoPath);
        vidStartTime = new Date(stat.ctime).getTime();
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", m, caller, `RNFS.stat(${videoPath})`);
        setPrepError(m);
      }
      try {
        const vidInfo = await RNFFprobe.getMediaInformation(videoPath);
        vidDuration = vidInfo.duration;
        vidStartTimeInFile = vidInfo.startTime;
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger(
          "WARNING",
          m,
          caller,
          `RNFFprobe.getMediaInformation(${videoPath})`
        );
        setPrepError(m);
      }
      setVideoStat({
        startTime: vidStartTime,
        endTime: vidStartTime + vidDuration,
        duration: vidDuration,
        startTimeInFile: vidStartTimeInFile,
      });
      /**
       * first telemetry time
       */
      let ALL_telemetry = [];
      try {
        const srcTelemetryPath =
          RNFS.ExternalDirectoryPath + "/" + FN.telemetry;
        let telemetryRead = "";
        telemetryRead = await RNFS.readFile(srcTelemetryPath);
        telemetryRead = telemetryRead.substring(0, telemetryRead.length - 1);
        telemetryRead = "[" + telemetryRead + "]";
        ALL_telemetry = JSON.parse(telemetryRead);
        setFirstTeleTime(ALL_telemetry[0].time);
        logger("DUMMY", `first tele time = ${ALL_telemetry[0].time}`, caller);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", m, caller, `RNFS.readFile(${FN.telemetry})`);
        setPrepError(m);
      }
      /**
       * save logger as json
       */
      let loggerPath = null;
      let loggerName = null;
      try {
        const srcLoggerFile = RNFS.ExternalDirectoryPath + "/" + FN.logger;
        let loggerRead = "";
        logger(
          "DEV",
          `RNFS.readFile(${srcLoggerFile})`,
          caller,
          "save as logger.json"
        );
        loggerRead = await RNFS.readFile(srcLoggerFile);
        loggerRead = loggerRead.substring(0, loggerRead.length - 1);
        loggerRead = "[" + loggerRead + "]";
        const loggerJSON_name = `logger_s${Date.now()}.json`;
        const loggerJSON_path =
          RNFS.ExternalDirectoryPath + "/" + loggerJSON_name;
        logger("DEV", `RNFS.writeFile(${loggerJSON_path}, )`, caller);
        await RNFS.writeFile(loggerJSON_path, loggerRead);
        loggerPath = loggerJSON_path;
        loggerName = loggerJSON_name;
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", m, caller, "save as logger.json");
        setPrepError(m);
      }
      /**
       * upload logger to AWS
       */
      try {
        const file = {
          uri: `file://${loggerPath}`,
          name: loggerName,
          type: "application/json",
        };
        const options = {
          keyPrefix: `loggers/`,
          bucket: "drone-guard-videos",
          region: "eu-west-1",
          accessKey: AWSkeys.accessKey,
          secretKey: AWSkeys.secretKey,
          successActionStatus: 201,
        };
        const res = await RNS3.put(file, options);
        if (res.status === 201) {
          logger(
            "DEV",
            res.body.postResponse.location,
            caller,
            "upload logger"
          );
          setLoggerURL(res.body.postResponse.location);
        } else {
          throw new Error(`status code = ${res.status}`);
        }
      } catch (e) {
        const m = e.hasOwnProperty("text") ? e.text : e;
        logger("ERROR", m, caller, "upload logger");
        setPrepError(m);
      }
      /**
       * read uploadStatus (emergency events list) from async storage
       * or create it from emergency events file, while respecting user events
       */
      let uploadStatus = [];
      try {
        const stringValue = await AsyncStorage.getItem(AS.uploadStatus);
        if (stringValue) uploadStatus = JSON.parse(stringValue);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger(
          "WARNING",
          m,
          caller,
          `AsyncStorage.getItem(${AS.uploadStatus})`
        );
        setPrepError(m);
      }
      //
      //if not first time visiting upload screen return
      if (uploadStatus.length > 0 && uploadStatus[0] !== 1) {
        logger("DUMMY", "using emergency events from local storage", caller);
        setEventsStatus(uploadStatus);
        isSubscribed && setPreparing(false);
        return;
      }
      //
      //if first time visiting upload screen create list from all telemetry file
      logger("DUMMY", "creating emergency events list from file", caller);
      const { emergencyHeight } = navConsts;
      let didTakeoff = false;
      let eventStartTime = -1;
      let emergencyEventsDetected = [];
      for (let i = 0; i < ALL_telemetry.length; i++) {
        const currTele = ALL_telemetry[i];
        if (!didTakeoff) {
          if (currTele.height > emergencyHeight) {
            didTakeoff = true;
          }
        } else {
          if (eventStartTime === -1 && currTele.height <= emergencyHeight) {
            eventStartTime = currTele.time;
            logger(
              "DUMMY",
              `emergency event start detected: ${eventStartTime}`,
              caller
            );
          }
          if (eventStartTime > -1 && currTele.height > emergencyHeight) {
            logger(
              "DUMMY",
              `emergency events end detected: ${currTele.time}`,
              caller
            );
            emergencyEventsDetected.push({
              startTime: eventStartTime,
              endTime: currTele.time,
            });
            eventStartTime = -1;
          }
        }
      }
      //
      //combine user events with detected events
      //TO-DO! remove overlapping events
      const emergencyEvents = [...emergencyEventsDetected, ...userEvents];
      //
      //create eventsStatus array
      const t = emergencyEvents.map((event, i) => ({
        startTime: event.startTime,
        endTime: event.endTime,
        index: i,
        lifeGuardID: null,
        beachID: null,
        //
        status: "pending",
        directoryName: null,
        directoryPath: null,
        ID: null,
        telemetry: {
          fileName: null,
          fullPath: null,
          awsURL: null,
          updatedDB: false,
        },
        thumbnail: {
          fileName: null,
          fullPath: null,
          awsURL: null,
          updatedDB: false,
        },
        video: {
          fileName: null,
          fullPath: null,
          awsURL: null,
          updatedDB: false,
        },
      }));
      setEventsStatus(t);
      try {
        await AsyncStorage.setItem(AS.uploadStatus, JSON.stringify(t));
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger(
          "WARNING",
          m,
          caller,
          `AsyncStorage.setItem(${AS.uploadStatus}, )`
        );
        setPrepError(m);
      }
      //
      isSubscribed && setPreparing(false);
    })();
    return function cleanup() {
      isSubscribed = false;
    };
  }, [requirePrepare]);
  //
  return [
    prepError,
    isPreparing,
    eventsStatus,
    videoStat,
    tokenIDs,
    firstTeleTime,
    loggerURL,
  ];
}
