import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import logger from "../logger";
const caller = "JoystickLeft.js";
const JoystickLeft = props => {
  const { setNavCommand } = props;
  return (
    <View style={styles.container}>
      <View style={styles.btnUpContainer}>
        <TouchableOpacity
          title=""
          style={[styles.btn, styles.btnUp]}
          onPress={() => {
            setNavCommand("forward");
            logger("OPERATION", "forward", caller);
          }}
        />
      </View>
      <View style={styles.btnLeftRightContainer}>
        <View style={styles.btnLeftContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnLeft]}
            onPress={() => {
              setNavCommand("left");
              logger("OPERATION", "left", caller);
            }}
          />
        </View>
        <View style={styles.btnRightContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnRight]}
            onPress={() => {
              setNavCommand("right");
              logger("OPERATION", "right", caller);
            }}
          />
        </View>
      </View>
      {/* <View style={styles.btnLeftRightContainer}> */}
      <View style={styles.btnDownContainer}>
        <TouchableOpacity
          title=""
          style={[styles.btn, styles.btnDown]}
          onPress={() => {
            setNavCommand("back");
            logger("OPERATION", "back", caller);
          }}
        />
      </View>
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    borderWidth: 4,
    borderStyle: "solid",
    borderColor: "#fff",
    borderRadius: 300,
    justifyContent: "space-between",
    position: "absolute",
    left: 20,
    bottom: 10,
    zIndex: 999
  },
  btn: {
    width: 0,
    height: 0,
    borderStyle: "solid"
  },
  btnUpContainer: {
    width: "100%",
    height: "30%"
  },
  btnUp: {
    borderLeftWidth: 20,
    borderLeftColor: "transparent",
    borderRightWidth: 20,
    borderRightColor: "transparent",
    borderBottomWidth: 20,
    borderBottomColor: "#fff",
    marginTop: 15,
    marginLeft: "auto",
    marginRight: "auto"
  },
  btnLeftRightContainer: {
    flexDirection: "row",
    width: "100%",
    height: "30%",
    justifyContent: "space-between",
    alignItems: "center"
  },
  btnLeft: {
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 20,
    borderTopColor: "transparent",
    borderRightWidth: 20,
    borderRightColor: "#fff",
    borderBottomWidth: 20,
    borderBottomColor: "transparent",
    marginLeft: 15
  },
  btnRightContainer: {
    justifyContent: "center"
  },
  btnRight: {
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 20,
    borderTopColor: "transparent",
    borderLeftWidth: 20,
    borderLeftColor: "#fff",
    borderBottomWidth: 20,
    borderBottomColor: "transparent",
    marginRight: 15
  },
  btnDownContainer: {
    width: "100%",
    height: "30%",
    justifyContent: "flex-end"
  },
  btnDown: {
    borderLeftWidth: 20,
    borderLeftColor: "transparent",
    borderRightWidth: 20,
    borderRightColor: "transparent",
    borderTopWidth: 20,
    borderTopColor: "#fff",
    marginBottom: 15,
    marginLeft: "auto",
    marginRight: "auto"
  }
});
JoystickLeft.propTypes = {
  setNavCommand: PropTypes.func.isRequired
};
export default JoystickLeft;
