//
import React from 'react';
import {StyleSheet, TouchableOpacity, Button} from 'react-native';
import PropTypes from 'prop-types';
import KeepAwake from 'react-native-keep-awake';
//
import useFFMPEG from '../Hooks/useFFMPEG';
import VideoStream from './VideoStream';
//
const StreamUI = props => {
  React.useEffect(() => {
    KeepAwake.activate();
    return function cleanup() {
      KeepAwake.deactivate();
    };
  }, []);
  useFFMPEG();
  //
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={e => {
        console.log(`x coord = ${e.nativeEvent.locationX}`);
      }}>
      <Button
        title="Welcome screen"
        style={styles.welcomeButton}
        onPress={() => props.setScreen('welcome')}
      />
      <VideoStream />
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 2,
  },
  welcomeButton: {
    zIndex: 20,
  },
});
StreamUI.propTypes = {
  setScreen: PropTypes.func.isRequired,
};
export default StreamUI;
