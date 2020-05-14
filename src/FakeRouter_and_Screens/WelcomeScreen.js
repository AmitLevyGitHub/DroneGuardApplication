import React from "react";
import PropTypes from "prop-types";
import { Button, Text, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import KeepAwake from "react-native-keep-awake";
//
import CropUploadStuff from "./CropUploadStuff";
import useTelemetry from "../Hooks/useTelemetry";
//
const WelcomeScreen = (props) => {
  React.useEffect(() => {
    KeepAwake.activate();
    return function cleanup() {
      KeepAwake.deactivate();
    };
  }, []);
  // useTelemetry();
  return (
    <ScrollView>
      <Text>Welcome to DroneGuard app</Text>
      <Icon.Button name="cog" onPress={() => props.setScreen("settings")} solid>
        Settings
      </Icon.Button>
      <Button title="mainUI" onPress={() => props.setScreen("mainUI")} />
      <CropUploadStuff />
    </ScrollView>
  );
};
WelcomeScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default WelcomeScreen;
