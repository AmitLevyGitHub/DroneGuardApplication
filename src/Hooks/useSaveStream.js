/**
 * ??NEED TO HANDLE ERRORS AND DISCONNECTIONS??
 */
import React from "react";
import { RNFFmpeg } from "react-native-ffmpeg";
import RNFS from "react-native-fs";
import { FN, streamingDevice, shouldSave } from "../Assets/consts";
import logger from "../logger";
const caller = "useSaveStream.js";
//
export default function useSaveStream(socket, hasStarted) {
  const shouldExecute = React.useRef(false);
  //
  React.useEffect(() => {
    (async () => {
      const saveVideo = shouldSave.video;
      if (!saveVideo) return;
      if (!hasStarted && !socket) return;
      // if (!isSocketConnected) return;
      // if (!socket) {
      //   //save video only after telemetry socket is open
      //   return;
      // } else {
      //   //after it is open need to wait a bit
      //   function sleep(ms) {
      //     return new Promise((resolve) => setTimeout(resolve, ms));
      //   }
      //   await sleep(500);
      // }
      //
      //save the video stream
      try {
        const videoPath = `${RNFS.ExternalDirectoryPath}/${FN.video}`;
        const FFMPEGcommand = `-i ${streamingDevice.url} -b:v 1000000 -c:v copy -r 60 -y ${videoPath}`;
        // const FFMPEGcommand = `-i ${streamingDevice.url} -b:v 1000000 -c:v copy -r 60 -y ${videoPath}`;
        // const FFMPEGcommand = `-i ${streamingDevice.url} -c:v copy ${videoPath}`;
        shouldExecute.current = true;
        logger("DEV", FFMPEGcommand, caller, "RNFFmpeg.execute()");
        const result = await RNFFmpeg.execute(FFMPEGcommand);
        logger("DEV", "success: " + result.rc, caller, "RNFFmpeg.execute()");
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("DEV", "error: " + m, caller, "RNFFmpeg.execute()");
      }
    })();
    //
    return function cleanup() {
      if (!shouldExecute.current) return;
      logger("DUMMY", "canceling save stream", caller, "RNFFmpeg.cancel()");
      RNFFmpeg.cancel();
    };
  }, [socket]);
  //
  return;
}
