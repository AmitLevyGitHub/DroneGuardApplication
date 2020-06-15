import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";

const JoystickLeft = (props) => {
  const { setNavCommand } = props;
  return (
    <View style={styles.container}>
      <View style={styles.btnUpContainer}>
        <TouchableOpacity
          title=""
          style={[styles.btn, styles.btnUp]}
          onPress={() => setNavCommand("forward")}
        />
      </View>
      <View style={styles.btnLeftRightContainer}>
        <View style={styles.btnLeftContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnLeft]}
            onPress={() => setNavCommand("left")}
          />
        </View>
        <View style={styles.btnRightContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnRight]}
            onPress={() => setNavCommand("right")}
          />
        </View>
      </View>
      {/* <View style={styles.btnLeftRightContainer}> */}
      <View style={styles.btnDownContainer}>
        <TouchableOpacity
          title=""
          style={[styles.btn, styles.btnDown]}
          onPress={() => setNavCommand("back")}
        />
      </View>
      {/* </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    height: 120,
    borderWidth: 4,
    borderStyle: "solid",
    borderColor: "#fff",
    borderRadius: 300,
    justifyContent: "space-between",
    position: 'absolute',
    left: 20,
    bottom: 5,
    zIndex: 999
  },
  btn: {
    width: 0,
    height: 0,
    borderStyle: "solid",
  },
  btnUpContainer: {
    width: "100%",
    height: "30%",
    // backgroundColor: "blue"
  },
  btnUp: {
    borderLeftWidth: 15,
    borderLeftColor: "transparent",
    borderRightWidth: 15,
    borderRightColor: "transparent",
    borderBottomWidth: 15,
    borderBottomColor: "#fff",
    marginTop: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
  btnLeftRightContainer: {
    flexDirection: "row",
    width: "100%",
    height: "30%",
    justifyContent: "space-between",
    alignItems: "center",
    // backgroundColor: "red"
  },
  btnLeft: {
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 15,
    borderTopColor: "transparent",
    borderRightWidth: 15,
    borderRightColor: "#fff",
    borderBottomWidth: 15,
    borderBottomColor: "transparent",
    marginLeft: 10,
  },
  btnRightContainer: {
    justifyContent: "center",
  },
  btnRight: {
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 15,
    borderTopColor: "transparent",
    borderLeftWidth: 15,
    borderLeftColor: "#fff",
    borderBottomWidth: 15,
    borderBottomColor: "transparent",
    marginRight: 10,
  },
  btnDownContainer: {
    width: "100%",
    height: "30%",
    justifyContent: "flex-end",
    // backgroundColor: "orange"
  },
  btnDown: {
    borderLeftWidth: 15,
    borderLeftColor: "transparent",
    borderRightWidth: 15,
    borderRightColor: "transparent",
    borderTopWidth: 15,
    borderTopColor: "#fff",
    marginBottom: 10,
    marginLeft: "auto",
    marginRight: "auto",
  },
});
JoystickLeft.propTypes = {
  setNavCommand: PropTypes.func.isRequired,
};
export default JoystickLeft;
