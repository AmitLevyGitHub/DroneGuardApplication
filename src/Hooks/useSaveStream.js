/**
 * NEED TO HANDLE ERRORS AND DISCONNECTIONS!
 * if (someError) setErrorOccurred(prevState => !prevState);
 */
import React from "react";
import { RNFFmpeg } from "react-native-ffmpeg";
import RNFS from "react-native-fs";
import { streamDeviceDomain } from "../Assets/consts";
export default function useSaveStream() {
  const [errorOccurred, setErrorOccurred] = React.useState(false);
  const shouldExecute = React.useRef(false);
  const saveVideo = false;
  const videoPath = RNFS.ExternalDirectoryPath + "/streamVideo.h264";
  const FFMPEGcommand = `-i rtmp://${streamDeviceDomain}/live/myVideo -b 1000000 -vcodec copy -r 60 -y ${videoPath}`;
  React.useEffect(() => {
    (async () => {
      if (!saveVideo) return;
      try {
        console.log(`saving video to ${videoPath}`);
        const command = FFMPEGcommand;
        shouldExecute.current = true;
        const result = await RNFFmpeg.execute(command);
        console.log("\n-\n-\n-\nFFmpeg process exited with rc " + result.rc);
      } catch (error) {
        console.log("\n\n\n\n\nFFMPEG execute error!");
        console.log(error.hasOwnProperty("message") ? error.message : error);
      }
    })();
    return function cleanup() {
      if (!shouldExecute.current) return;
      console.log("\n\n\n\n\nCalling RNFFmpeg.cancel()");
      RNFFmpeg.cancel();
    };
  }, [FFMPEGcommand, saveVideo, videoPath]);
  return [errorOccurred];
}
