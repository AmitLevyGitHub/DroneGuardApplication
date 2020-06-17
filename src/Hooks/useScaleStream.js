import React from "react";
import { Dimensions } from "react-native";
import Orientation from "react-native-orientation-locker";
import logger from "../logger";
const caller = "useScaleStream.js";
//
export default function useScaleStream(streamWidth, streamHeight) {
  const [windowWidth, setWindowWidth] = React.useState(0);
  const [windowHeight, setWindowHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    function handleRotate() {
      const { width, height } = Dimensions.get("window");
      setWindowWidth(width);
      setWindowHeight(height);
    }
    handleRotate();
    Orientation.addOrientationListener(handleRotate);
    return function cleanup() {
      Orientation.removeOrientationListener(handleRotate);
    };
  }, []);
  //
  const { width, height } = Dimensions.get("window");
  const [scaledWidth, setScaledWidth] = React.useState(width);
  const [scaledHeight, setScaledHeight] = React.useState(height);
  React.useLayoutEffect(() => {
    const scale = Math.min(
      windowWidth / streamWidth,
      windowHeight / streamHeight
    );
    setScaledWidth(Math.floor(streamWidth * scale));
    setScaledHeight(Math.floor(streamHeight * scale));
    logger(
      "DUMMY",
      `in useScaleStream.js
      windowWidth = ${windowWidth} -- streamWidth = ${streamWidth}
      windowHeight = ${windowHeight} -- streamHeight = ${streamHeight}
      scale = ${scale}
      videoWidth = ${Math.floor(streamWidth * scale)}
      videoHeight = ${Math.floor(streamHeight * scale)}`,
      caller
    );
  }, [windowHeight, windowWidth, streamWidth, streamHeight]);
  //
  return [scaledWidth, scaledHeight];
}
