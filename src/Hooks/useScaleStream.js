import React from "react";
import { Dimensions } from "react-native";
import Orientation from "react-native-orientation-locker";
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
  const [scaledWidth, setScaledWidth] = React.useState(0);
  const [scaledHeight, setScaledHeight] = React.useState(0);
  React.useLayoutEffect(() => {
    const scale = Math.min(
      windowWidth / streamWidth,
      windowHeight / streamHeight
    );
    setScaledWidth(streamWidth * scale);
    setScaledHeight(streamHeight * scale);
    console.log(`
      in useScaleStream.js
      windowWidth = ${windowWidth} -- streamWidth = ${streamWidth}
      windowHeight = ${windowHeight} -- streamHeight = ${streamHeight}
      scale = ${scale}
      videoWidth = ${streamWidth * scale}
      videoHeight = ${streamHeight * scale}
    `);
  }, [windowHeight, windowWidth, streamWidth, streamHeight]);
  //
  return [scaledWidth, scaledHeight];
}