import React from 'react';
import PropTypes from 'prop-types';
import {Button, View, Text} from 'react-native';
import Orientation from 'react-native-orientation-locker';

const WelcomeScreen = props => {
  return (
    <View>
      <Text>Welcome to DroneGuard app</Text>
      <Text>This screen orientation should match the device orientation</Text>
      <Text>Screen orientation: {Orientation.getInitialOrientation()}</Text>
      <Button title="Settings" onPress={() => props.setScreen('settings')} />
      <Button title="mainUI" onPress={() => props.setScreen('mainUI')} />
    </View>
  );
};
WelcomeScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default WelcomeScreen;
