import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import logger from "../logger";
const caller = "JoystickRight.js";

const JoystickRight = props => {
  const onPressUp = () => {
    setNavCommand("up");
    logger("OPERATION", "up", caller);
  };

  const onPressDown = () => {
    setNavCommand("down");
    logger("OPERATION", "down", caller);
  };

  const { setNavCommand } = props;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.btnContainer} onPress={onPressUp}>
        <View style={[styles.btn, styles.btnUp]} />
        <View style={[styles.btnLittle, styles.btnUpLittle]} />
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.btnContainer, styles.btnUpContainer]}
        onPress={onPressDown}
      >
        <View style={[styles.btnLittle, styles.btnDownLittle]} />
        <View style={[styles.btn, styles.btnDown]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 180,
    borderWidth: 4,
    borderStyle: "solid",
    borderColor: "#fff",
    borderRadius: 300,
    justifyContent: "space-between",
    position: "absolute",
    right: 20,
    bottom: 10,
    zIndex: 999
  },
  btn: {
    width: 20,
    height: 20,
    borderStyle: "solid"
  },
  btnContainer: {
    width: "100%",
    height: "50%",
    justifyContent: "center"
  },
  btnDownContainer: {
    justifyContent: "center",
    alignItems: "flex-end",
    transform: [{ rotate: "180deg" }]
  },
  btnUp: {
    borderTopWidth: 0,
    borderTopColor: "transparent",
    borderRightWidth: 3,
    borderRightColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "-135deg" }]
  },
  btnDown: {
    borderTopWidth: 0,
    borderTopColor: "transparent",
    borderRightWidth: 3,
    borderRightColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "45deg" }]
  },
  btnLittle: {
    width: 15,
    height: 15,
    borderStyle: "solid"
  },
  btnUpLittle: {
    borderTopWidth: 0,
    borderTopColor: "transparent",
    borderRightWidth: 3,
    borderRightColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
    marginTop: -12,
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "-135deg" }]
  },
  btnDownLittle: {
    borderTopWidth: 0,
    borderTopColor: "transparent",
    borderRightWidth: 3,
    borderRightColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
    marginBottom: -12,
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "45deg" }]
  }
});
JoystickRight.propTypes = {
  setNavCommand: PropTypes.func.isRequired
};
export default JoystickRight;
