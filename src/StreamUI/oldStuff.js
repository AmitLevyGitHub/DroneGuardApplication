//
import React from 'react';
import {View} from 'react-native';
//
import {NodePlayerView} from 'react-native-nodemediaclient';
import {RNFFmpeg} from 'react-native-ffmpeg';
import RNFS from 'react-native-fs';
//
import styles from '../styles';
const domain = '192.168.68.131';
const URL = `rtmp://${domain}/live/myVideo`;
const videoPath = RNFS.ExternalDirectoryPath + '/streamVideo.h264';
const command = `-i rtmp://${domain}/live/myVideo -b 1000000 -vcodec copy -r 60 -y ${videoPath}`;
const VideoStream = () => {
  React.useLayoutEffect(() => {
    (async () => {
      try {
        console.log('\n\n\n\n\n');
        const result = await RNFFmpeg.execute(command);
        console.log(JSON.stringify(result, null, 2));
      } catch (error) {
        console.log('\n\n\n\n\nFFMPEG execute error!');
        //IMPOSSIBLE to get here! If you get here, something is wrong with your code but not FFMPEG!
        console.log(error);
        console.log(error.message);
        console.log(JSON.stringify(error, null, 2));
      }
    })();
    return function cleanup() {
      console.log('\n\n\n\n\nCalling RNFFmpeg.cancel()');
      RNFFmpeg.cancel();
    };
  }, []);

  return (
    <View style={styles.container}>
      <NodePlayerView
        style={styles.streamerCameraView}
        inputUrl={URL}
        scaleMode="ScaleAspectFit"
        bufferTime={300}
        maxBufferTime={1000}
        autoplay
      />
    </View>
  );
};
export default VideoStream;
