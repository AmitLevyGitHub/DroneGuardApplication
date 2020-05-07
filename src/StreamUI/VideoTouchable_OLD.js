import React from "react";
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Modal,
  Text,
} from "react-native";
import PropTypes from "prop-types";
//
import { NodePlayerView } from "react-native-nodemediaclient";
import { streamDeviceDomain } from "../../Assets/consts";
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "#0077be",
  },
});
//
const VideoTouchable = (props) => {
  const [myRef, setMyRef] = React.useState(null);
  const RTMPstreamURL = `rtmp://${streamDeviceDomain}/live/myVideo`;
  //
  const { scaledWidth, scaledHeight } = props;
  return (
    <TouchableWithoutFeedback
      onPress={(e) => {
        if (props.isNavigating) return; //disable press input when navigation is happening!
        const axisX_res = e.nativeEvent.locationX - scaledWidth / 2;
        const axisY_res = (e.nativeEvent.locationY - scaledHeight / 2) * -1;
        props.setAxisX(axisX_res);
        props.setAxisY(axisY_res);
        console.log(`
          absoluteX = ${e.nativeEvent.locationX}
          absoluteY = ${e.nativeEvent.locationY}
          axisX = ${axisX_res}
          axisY = ${axisY_res}
        `);
      }}
    >
      <NodePlayerView
        style={{
          // position: "absolute",
          backgroundColor: "#B6DCE9",
          // bottom: 0,
          // left: 0,
          width: scaledWidth,
          height: scaledHeight,
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
    </TouchableWithoutFeedback>
  );
};
//
VideoTouchable.propTypes = {
  scaledWidth: PropTypes.number.isRequired,
  scaledHeight: PropTypes.number.isRequired,
  //
  setAxisX: PropTypes.func.isRequired,
  setAxisY: PropTypes.func.isRequired,
  isNavigating: PropTypes.bool.isRequired,
};
export default VideoTouchable;
