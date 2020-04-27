import {StyleSheet, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2,
  },
  streamerCameraView: {
    position: 'absolute',
    top: 20,
    left: 20,
    height: height - 60,
    width: width - 40,
    zIndex: 1,
  },
  backgroundVideo: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});

export default styles;
