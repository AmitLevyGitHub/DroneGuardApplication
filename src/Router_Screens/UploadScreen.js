import React from "react";
import PropTypes from "prop-types";
import { Button, View, Text } from "react-native";
import CropUploadStuff from "./CropUploadStuff";
import { S } from "../Assets/consts";
const UploadScreen = (props) => {
  return (
    <View>
      <Text>Upload Screen</Text>
      <Button title="Home Screen" onPress={() => props.setScreen(S.home)} />
      <CropUploadStuff />
    </View>
  );
};
UploadScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default UploadScreen;
