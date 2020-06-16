import React from "react";
import AsyncStorage from "@react-native-community/async-storage";
import RNFS from "react-native-fs";
import { RNFFprobe } from "react-native-ffmpeg";
import { AS, FN, navConsts } from "../Assets/consts";
export default function usePrepareUpload(requirePrepare, userEvents) {
  const [isPreparing, setPreparing] = React.useState(true);
  const [prepError, setPrepError] = React.useState(null);
  const [eventsStatus, setEventsStatus] = React.useState([]);
  const [videoStat, setVideoStat] = React.useState(null);
  const [tokenIDs, setTokenIDs] = React.useState(null);
  const [firstTeleTime, setFirstTeleTime] = React.useState(0);
  React.useEffect(() => {
    console.log("preparing");
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
        console.log(`ERROR reading ${AS.userToken} from async storage!\n${m}`);
        setPrepError(m);
      }
      let lifeGuardId = null;
      try {
        lifeGuardId = await AsyncStorage.getItem(AS.lifeGuardId);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(
          `ERROR reading ${AS.lifeGuardId} from async storage!\n${m}`
        );
        setPrepError(m);
      }
      let beachId = null;
      try {
        beachId = await AsyncStorage.getItem(AS.beachId);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(`ERROR reading ${AS.beachId} from async storage!\n${m}`);
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
        console.log(`ERROR reading file ${FN.video}: ${m}`);
        setPrepError(m);
      }
      try {
        const vidInfo = await RNFFprobe.getMediaInformation(videoPath);
        vidDuration = vidInfo.duration;
        console.log(`duration = ${vidDuration}`);
        vidStartTimeInFile = vidInfo.startTime;
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(
          `error executing RNFFprobe.getMediaInformation for file ${FN.video}\n${m}`
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
        console.log(`first tele time = ${ALL_telemetry[0].time}`);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(`ERROR reading file ${FN.telemetry}\n${m}`);
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
        console.log(
          `ERROR reading ${AS.uploadStatus} from async storage!\n${m}`
        );
        setPrepError(m);
      }
      //
      //if not first time visiting upload screen return
      if (uploadStatus.length > 0 && uploadStatus[0] !== 1) {
        console.log("using emergency events from local storage");
        setEventsStatus(uploadStatus);
        // console.log(JSON.stringify(uploadStatus, null, 2))
        isSubscribed && setPreparing(false);
        return;
      }
      //
      //if first time visiting upload screen create list from all telemetry file
      console.log("creating emergency events list from file");
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
            console.log(`emergency event start detected: ${eventStartTime}`);
          }
          if (eventStartTime > -1 && currTele.height > emergencyHeight) {
            console.log(`emergency events end detected: ${currTele.time}`);
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
        console.log(`ERROR setting ${AS.uploadStatus} in async storage!\n${m}`);
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
  ];
}
