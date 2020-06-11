import React from "react";
import AsyncStorage from "@react-native-community/async-storage";
import RNFS from "react-native-fs";
import { RNFFprobe } from "react-native-ffmpeg";
import { AS, FN } from "../Assets/consts";
export default function usePrepareUpload() {
  const [isPreparing, setPreparing] = React.useState(true);
  const [eventsStatus, setEventsStatus] = React.useState([]);
  const [videoStat, setVideoStat] = React.useState(null);
  const [tokenIDs, setTokenIDs] = React.useState(null);
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
        console.log(`ERROR reading ${AS.userToken} from async storage!\n${m}`);
      }
      let lifeGuardId = null;
      try {
        lifeGuardId = await AsyncStorage.getItem(AS.lifeGuardId);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(
          `ERROR reading ${AS.lifeGuardId} from async storage!\n${m}`
        );
      }
      let beachId = null;
      try {
        beachId = await AsyncStorage.getItem(AS.beachId);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(`ERROR reading ${AS.beachId} from async storage!\n${m}`);
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
      }
      setVideoStat({
        startTime: vidStartTime,
        endTime: vidStartTime + vidDuration,
        duration: vidDuration,
        startTimeInFile: vidStartTimeInFile,
      });
      /**
       * read eventsStatus from async storage / create it from emergency events file
       */
      let uploadStatus = [];
      try {
        const stringValue = await AsyncStorage.getItem(AS.uploadStatus);
        if (stringValue) uploadStatus = JSON.parse(stringValue);
      } catch (e) {
        console.log(`error reading ${AS.uploadStatus}!`);
      }
      //
      //if not first time return
      if (uploadStatus.length > 0 && uploadStatus[0] !== 1) {
        console.log("using emergency events from local storage");
        setEventsStatus(uploadStatus);
        // console.log(JSON.stringify(uploadStatus, null, 2))
        isSubscribed && setPreparing(false);
        return;
      }
      //
      //if first time read from file
      console.log("loading emergency events from file");
      const emergencyEventsPath = RNFS.ExternalDirectoryPath + "/" + FN.events;
      let ALL_events = null;
      try {
        let dataRead = "";
        dataRead = await RNFS.readFile(emergencyEventsPath);
        dataRead = dataRead.substring(0, dataRead.length - 1);
        dataRead = "[" + dataRead + "]";
        // console.log(dataRead);
        ALL_events = JSON.parse(dataRead);
        console.log(`emergency events found: ${ALL_events.length} total`);
      } catch (e) {
        console.log(
          `ERROR reading file ${FN.events}: ${
            e.hasOwnProperty("message") ? e.message : e
          }`
        );
      }
      //
      //create eventsStatus array
      const t = ALL_events.map((event, i) => ({
        startTime: event.startTime,
        endTime: event.endTime,
        index: i,
        lifeGuardID: null,
        beachID: null,
        //
        failed: false,
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
        console.log(
          `ERROR setting ${AS.uploadStatus} in async storage!\n${
            e.hasOwnProperty("message") ? e.message : e
          }`
        );
      }
      //
      isSubscribed && setPreparing(false);
    })();
    return function cleanup() {
      isSubscribed = false;
    };
  }, []);
  //
  return [isPreparing, eventsStatus, videoStat, tokenIDs];
}
