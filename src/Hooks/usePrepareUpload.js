import React from "react";
import AsyncStorage from "@react-native-community/async-storage";
import RNFS from "react-native-fs";
import { RNFFprobe } from "react-native-ffmpeg";
import { AS, FN } from "../Assets/consts";
export default function usePrepareUpload() {
  const [isPreparing, setPreparing] = React.useState(true);
  const [eventsStatus, setEventsStatus] = React.useState([]);
  const [videoStat, setVideoStat] = React.useState(null);
  React.useEffect(() => {
    let isSubscribed = true;
    (async () => {
      setPreparing(true);
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
        console.log(
          `ERROR reading file ${FN.video}: ${
            e.hasOwnProperty("message") ? e.message : e
          }`
        );
      }
      try {
        const vidInfo = await RNFFprobe.getMediaInformation(videoPath);
        vidDuration = vidInfo.duration;
        vidStartTimeInFile = vidInfo.startTime;
      } catch (e) {
        console.log(
          `ERROR executing RNFFprobe.getMediaInformation for file ${
            FN.video
          }: ${e.hasOwnProperty("message") ? e.message : e}`
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
      let uploadStatus = null;
      try {
        const stringValue = await AsyncStorage.getItem(AS.uploadStatus);
        if (stringValue) uploadStatus = JSON.parse(stringValue);
      } catch (e) {
        console.log(`error reading ${AS.uploadStatus}!`);
      }
      if (!uploadStatus || !uploadStatus.hasOwnProperty("interrupted")) {
        uploadStatus = {
          interrupted: true,
        };
      }
      //
      //if not first time return
      if (uploadStatus.hasOwnProperty("eventsStatus")) {
        isSubscribed && setPreparing(false);
        return;
      }
      //
      //if first time read from file
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
        folderName: null,
        ID: null,
        telemetry: {
          name: null,
          isUpload: false,
          URL: null,
        },
        thumbnail: {
          name: null,
          isUpload: false,
          URL: null,
        },
        video: {
          name: null,
          isUpload: false,
          URL: null,
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
  return [isPreparing, eventsStatus, videoStat];
}
