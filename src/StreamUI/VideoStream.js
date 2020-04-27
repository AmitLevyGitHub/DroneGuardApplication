import React from 'react';
import {NodePlayerView} from 'react-native-nodemediaclient';
import {TouchableOpacity, StyleSheet, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');
//
const VideoStream = () => {
  const [myRef, setMyRef] = React.useState(null);
  const streamDeviceDomain = '192.168.68.131'; // const streamDeviceDomain = '192.168.68.126';
  const RTMPstreamURL = `rtmp://${streamDeviceDomain}/live/myVideo`;
  //
  React.useLayoutEffect(() => {
    console.log(`width = ${width} -- height= ${height}`);
  });
  //
  return (
    <NodePlayerView
      style={styles.streamerCameraView}
      ref={vp => setMyRef(vp)}
      inputUrl={RTMPstreamURL}
      scaleMode="ScaleAspectFit"
      bufferTime={300}
      maxBufferTime={1000}
      autoplay
    />
  );
};
const styles = StyleSheet.create({
  streamerCameraView: {
    position: 'absolute',
    backgroundColor: '#B6DCE9',
    top: 0,
    left: 0,
    width,
    height,
    zIndex: 1,
  },
});
export default VideoStream;
