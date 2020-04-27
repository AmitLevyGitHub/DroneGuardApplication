//
import React from 'react';
import {View, Button} from 'react-native';
import PropTypes from 'prop-types';
import Orientation from 'react-native-orientation-locker';
//
import styles from '../styles';
import VideoStream from './VideoStream';
//
const StreamUI = props => {
  React.useLayoutEffect(() => {
    Orientation.lockToLandscapeLeft();
  }, []);
  //
  return (
    <View style={styles.container}>
      <VideoStream />
      <Button
        title="Welcome screen"
        onPress={() => props.setScreen('welcome')}
      />
    </View>
  );
};
StreamUI.propTypes = {
  setScreen: PropTypes.func.isRequired,
};
export default StreamUI;
