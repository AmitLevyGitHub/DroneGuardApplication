import {StyleSheet, Dimensions} from 'react-native';
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2,
  },
  streamerCameraView: {
    position: 'absolute',
    backgroundColor: '#B6DCE9',
    top: 0,
    left: 0,
    height: 720,
    width: 960,
    zIndex: 1,
  },
});

export default styles;
