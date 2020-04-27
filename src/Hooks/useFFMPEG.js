import React from 'react';
import {RNFFmpeg} from 'react-native-ffmpeg';
import RNFS from 'react-native-fs';
export default function useFFMPEG() {
  const saveVideo = false;
  const streamDeviceDomain = '192.168.68.131'; // const streamDeviceDomain = '192.168.68.126';
  const videoPath = RNFS.ExternalDirectoryPath + '/streamVideo.h264';
  const FFMPEGcommand = `-i rtmp://${streamDeviceDomain}/live/myVideo -b 1000000 -vcodec copy -r 60 -y ${videoPath}`;
  React.useLayoutEffect(() => {
    (async () => {
      if (!saveVideo) return;
      try {
        const command = FFMPEGcommand;
        const result = await RNFFmpeg.execute(command);
        console.log('\n-\n-\n-\nFFmpeg process exited with rc ' + result.rc);
      } catch (error) {
        console.log('\n\n\n\n\nFFMPEG execute error!');
        console.log(error.hasOwnProperty('message') ? error.message : error);
      }
    })();
    return function cleanup() {
      console.log('\n\n\n\n\nCalling RNFFmpeg.cancel()');
      RNFFmpeg.cancel();
    };
  }, [FFMPEGcommand, saveVideo]);
}
