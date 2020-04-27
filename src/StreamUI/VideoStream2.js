import React from 'react';
import {RtmpView} from 'react-native-rtmpview';
import {
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  StyleSheet,
  Dimensions,
} from 'react-native';
const {width, height} = Dimensions.get('window');
//
const VideoStream2 = () => {
  const [myRef, setMyRef] = React.useState(null);
  const streamDeviceDomain = '192.168.68.131'; // const streamDeviceDomain = '192.168.68.126';
  const RTMPstreamURL = `rtmp://${streamDeviceDomain}/live/myVideo`;
  //
  React.useLayoutEffect(() => {
    console.log(`width = ${width} -- height= ${height}`);
  });
  React.useLayoutEffect(() => {
    let RNRtmpEventManager = NativeModules.RNRtmpEventManager;
    if (!(typeof RNRtmpEventManager === 'undefined')) {
      const RNRtmpEventManager = new NativeEventEmitter(
        NativeModules.RNRtmpEventManager,
      );

      RNRtmpEventManager.addListener('RNRtmpEvent', data => {
        console.log(
          'React Native Received RNRtmpEventManager ' + JSON.stringify(data),
        );
      });

      console.log('React Native Received: Just finished adding listeners');
    }
  }, []);
  //
  return (
    <RtmpView
      shouldMute={true}
      ref={vp => setMyRef(vp)}
      onPlaybackState={data => {
        console.log(
          'React Native Received PlaybackState ' + data.nativeEvent['state'],
        );
      }}
      onLoadState={data => {
        console.log(
          'React Native Received LoadState ' + data.nativeEvent['state'],
        );
        console.log(
          'React Native Received LoadState Qos ' +
            JSON.stringify(data.nativeEvent['qos']),
        );
      }}
      onFirstVideoFrameRendered={data => {
        console.log('React Native Received FirstVideoFrameRendered');
      }}
      onBitrateRecalculated={data => {
        console.log(
          'React Native BitrateRecalculated ' +
            JSON.stringify(data.nativeEvent['bitrate']),
        );
      }}
      url="rtmp://stream1.livestreamingservices.com:1935/tvmlive/tvmlive"
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
export default VideoStream2;
