import React from 'react';
import {NodePlayerView} from 'react-native-nodemediaclient';
import {RNFFmpeg} from 'react-native-ffmpeg';
import RNFS from 'react-native-fs';
import styles from './VideoStream.styles';
//
const VideoStream = () => {
  const [myRef, setMyRef] = React.useState(null);
  const saveVideo = false;
  const domain = '192.168.68.131'; // const domain = '192.168.68.126';
  const RTMPstreamURL = `rtmp://${domain}/live/myVideo`;
  const videoPath = RNFS.ExternalDirectoryPath + '/streamVideo.h264';
  const FFMPEGcommand = `-i rtmp://${domain}/live/myVideo -b 1000000 -vcodec copy -r 60 -y ${videoPath}`;
  React.useLayoutEffect(() => {
    (async () => {
      if (saveVideo) {
        try {
          const command = FFMPEGcommand;
          const result = await RNFFmpeg.execute(command);
          console.log('\n-\n-\n-\nFFmpeg process exited with rc ' + result.rc);
        } catch (error) {
          console.log('\n\n\n\n\nFFMPEG execute error!');
          console.log(error.hasOwnProperty('message') ? error.message : error);
        }
      }
    })();
    return function cleanup() {
      console.log('\n\n\n\n\nCalling RNFFmpeg.cancel()');
      RNFFmpeg.cancel();
    };
  }, [FFMPEGcommand, saveVideo]);
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
export default VideoStream;
