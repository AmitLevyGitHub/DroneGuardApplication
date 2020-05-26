import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";

const JoystickRight = (props) => {
  const { socket } = props;
  function emitDefault(type) {
    if (!socket.connected) {
      console.log(
        `trying to emit type: ${type} to server but socket is not open!`
      );
      return;
    }
    console.log(`emitting type: ${type} to server`);
    socket.emit("command", { type });
  }
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.btnContainer}
        onPress={() => emitDefault("up")}
      >
        <View style={[styles.btn, styles.btnUp]} />
        <View style={[styles.btnLittle, styles.btnUpLittle]} />
      </TouchableOpacity>
      <View style={styles.btnSpinLeftRightContainer}>
        <View style={styles.btnSpinLeftContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnSpinLeft]}
            onPress={() => emitDefault("spinLeft")}
          >
            <View style={[styles.spinBtnArrow, styles.spinBtnArrowLeft]} />
          </TouchableOpacity>
        </View>
        <View style={styles.btnRightContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnSpinRight]}
            onPress={() => emitDefault("spinRight")}
          >
            <View style={[styles.spinBtnArrow, styles.spinBtnArrowRight]} />
            {/* <View style={[styles.spinBtnArrow, styles.spinBtnArrowLeft]} /> */}
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={[styles.btnContainer, styles.btnUpcontainer]}
        onPress={() => emitDefault("down")}
      >
        <View style={[styles.btnLittle, styles.btnDownLittle]} />
        <View style={[styles.btn, styles.btnDown]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    borderWidth: 8,
    borderStyle: "solid",
    borderColor: "#fff",
    borderRadius: 300,
    justifyContent: "space-between",
  },
  btn: {
    width: 30,
    height: 30,
    borderStyle: "solid",
  },
  // spinBtn: {
  //     width: 30,
  //     height: 30,
  //     borderStyle: "solid",
  // },
  btnContainer: {
    width: "100%",
    height: "30%",
    // backgroundColor: "blue"
  },
  btnDowncontainer: {
    transform: [{ rotate: "180deg" }],
    // backgroundColor: "blue"
  },
  btnUp: {
    // backgroundColor: "blue",
    borderTopWidth: 0,
    borderTopColor: "transparent",
    borderRightWidth: 3,
    borderRightColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
    marginTop: 20,
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "-135deg" }],
  },
  btnDown: {
    // backgroundColor: "blue",
    borderTopWidth: 0,
    borderTopColor: "transparent",
    borderRightWidth: 3,
    borderRightColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#fff",
    borderLeftWidth: 0,
    borderLeftColor: "transparent",
    marginBottom: 20,
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "45deg" }],
  },
  btnLittle: {
    width: 25,
    height: 25,
    borderStyle: "solid",
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
    marginTop: -18,
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "-135deg" }],
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
    marginBottom: -18,
    marginLeft: "auto",
    marginRight: "auto",
    transform: [{ rotate: "45deg" }],
  },
  btnSpinLeftRightContainer: {
    flexDirection: "row",
    width: "100%",
    height: "30%",
    justifyContent: "space-between",
    alignItems: "center",
    // backgroundColor: "red"
  },
  btnSpinLeft: {
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopColor: "#fff",
    borderRightColor: "#fff",
    borderRadius: 20,
    marginLeft: 15,
  },
  btnSpinRight: {
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopColor: "#fff",
    borderLeftColor: "#fff",
    borderRadius: 30,
    marginRight: 15,
  },
  spinBtnArrow: {
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 10,
    borderTopColor: "transparent",
    borderLeftWidth: 10,
    borderLeftColor: "#fff",
    borderBottomWidth: 10,
    borderBottomColor: "transparent",
  },
  spinBtnArrowLeft: {
    marginRight: 40,
    marginLeft: -5,
    transform: [{ rotate: "125deg" }],
  },
  spinBtnArrowRight: {
    marginLeft: 20,
    marginRight: -5,
    transform: [{ rotate: "60deg" }],
  },
  btnRightContainer: {
    justifyContent: "center",
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
    marginRight: 15,
  },
});
JoystickRight.propTypes = {
  socket: PropTypes.object.isRequired,
};
export default JoystickRight;
