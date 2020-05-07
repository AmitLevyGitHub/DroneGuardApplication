/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import { NodePlayerView } from "react-native-nodemediaclient";
import { streamDeviceDomain } from "../../Assets/consts";
//
const VideoStream = (props) => {
  const [myRef, setMyRef] = React.useState(null);
  const RTMPstreamURL = `rtmp://${streamDeviceDomain}/live/myVideo`;
  //
  return (
    <NodePlayerView
      style={{
        position: "absolute",
        backgroundColor: "#B6DCE9",
        bottom: 0,
        left: 0,
        width: props.scaledWidth,
        height: props.scaledHeight,
        zIndex: 0,
      }}
      ref={(vp) => setMyRef(vp)}
      inputUrl={RTMPstreamURL}
      scaleMode="ScaleAspectFit"
      bufferTime={100}
      maxBufferTime={1000}
      autoplay
      onStatus={() => console.log("on status func")}
      renderType="SURFACEVIEW"
    />
  );
};
VideoStream.propTypes = {
  scaledWidth: PropTypes.number.isRequired,
  scaledHeight: PropTypes.number.isRequired,
};
export default VideoStream;
