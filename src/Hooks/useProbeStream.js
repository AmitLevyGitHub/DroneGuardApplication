import React from "react";
import { RNFFprobe } from "react-native-ffmpeg";
import cloneDeep from "lodash/cloneDeep";
import { streamingDevice } from "../Assets/consts";
export default function useProbeStream(errorOccurred) {
  const [isProbing, setIsProbing] = React.useState(true);
  const [width, setWidth] = React.useState(960);
  const [height, setHeight] = React.useState(540);
  const [firstVideoStream, setFirstVideoStream] = React.useState({});
  React.useLayoutEffect(() => {
    (async () => {
      setIsProbing(true);
      try {
        console.log(`start probing URL = ${streamingDevice.url}`);
        const streamInfo = await RNFFprobe.getMediaInformation(
          streamingDevice.url
        );
        const streams = streamInfo.streams;
        for (let i = 0; i < streams.length; i++) {
          if (
            streams[i].hasOwnProperty("type") &&
            streams[i].type === "video"
          ) {
            setFirstVideoStream(cloneDeep(streams[i]));
            if (streams[i].hasOwnProperty("width")) setWidth(streams[i].width);
            if (streams[i].hasOwnProperty("height"))
              setHeight(streams[i].height);
            break;
          }
        }
      } catch (error) {
        console.log("\n\n\n\n\nRNFFmpeg probe error!");
        console.log(error.hasOwnProperty("message") ? error.message : error);
      }
      setIsProbing(false);
    })();
  }, [errorOccurred]);
  return [isProbing, width, height];
}
