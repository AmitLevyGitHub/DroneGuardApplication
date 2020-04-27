import React from 'react';
import PropTypes from 'prop-types';
import {Button, View, Text} from 'react-native';
import Orientation from 'react-native-orientation-locker';

const SettingsScreen = props => {
  return (
    <View>
      <Text>Welcome to DroneGuard app</Text>
      <Text>This screen orientation should match the device orientation</Text>
      <Text>Screen orientation: {Orientation.getInitialOrientation()}</Text>
      <Button
        title="Welcome screen"
        onPress={() => props.setScreen('welcome')}
      />
    </View>
  );
};
SettingsScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default SettingsScreen;
