import React from "react";
import PropTypes from "prop-types";
import { Button, View, Text } from "react-native";
import Orientation from "react-native-orientation-locker";

const SettingsScreen = (props) => {
  return (
    <View>
      <Text>Settings Screen</Text>
      <Button
        title="Welcome screen"
        onPress={() => props.setScreen("welcome")}
      />
    </View>
  );
};
SettingsScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default SettingsScreen;
