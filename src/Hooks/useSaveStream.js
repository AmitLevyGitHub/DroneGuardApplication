/**
 * NEED TO HANDLE ERRORS AND DISCONNECTIONS!
 */
import React from "react";
import { RNFFmpeg } from "react-native-ffmpeg";
import RNFS from "react-native-fs";
import { FN, streamingDevice, shouldSave } from "../Assets/consts";
//
export default function useSaveStream(socket) {
  const [errorOccurred, setErrorOccurred] = React.useState(false);
  const shouldExecute = React.useRef(false);
  //
  React.useEffect(() => {
    (async () => {
      const saveVideo = shouldSave.video;
      if (!saveVideo) return;
      if (!socket) return;
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
        console.log(`saving video to ${videoPath}`);
        shouldExecute.current = true;
        videoStartTime = Date.now();
        const result = await RNFFmpeg.execute(FFMPEGcommand);
        console.log("\n-\n-\n-\nFFmpeg process exited with rc " + result.rc);
      } catch (error) {
        console.log("\n\n\n\n\nFFMPEG execute error!");
        console.log(error.hasOwnProperty("message") ? error.message : error);
      }
    })();
    //
    return function cleanup() {
      if (!shouldExecute.current) return;
      console.log("\n\n\n\n\nCalling RNFFmpeg.cancel()");
      RNFFmpeg.cancel();
    };
  }, [socket]);
  //
  return [errorOccurred];
}
