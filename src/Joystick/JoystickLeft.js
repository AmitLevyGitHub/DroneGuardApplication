import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, View, TouchableOpacity } from "react-native";

const JoystickLeft = (props) => {
  const { socket } = props;
  return (
    <View style={styles.container}>
      <View style={styles.btnUpContainer}>
        <TouchableOpacity
          title=""
          style={[styles.btn, styles.btnUp]}
          onPress={() => {
            if (!socket) {
              console.log(
                "trying to emit forward event to server but socket not open"
              );
              return;
            }
            const emitTime = Date.now();
            socket.emit("forward", emitTime);
          }}
        />
      </View>
      <View style={styles.btnLeftRightContainer}>
        <View style={styles.btnLeftContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnLeft]}
            onPress={() => {
              if (!socket) {
                console.log(
                  "trying to emit left event to server but socket not open"
                );
                return;
              }
              const emitTime = Date.now();
              socket.emit("left", emitTime);
            }}
          />
        </View>
        <View style={styles.btnRightContainer}>
          <TouchableOpacity
            title=""
            style={[styles.btn, styles.btnRight]}
            onPress={() => {
              if (!socket) {
                console.log(
                  "trying to emit right event to server but socket not open"
                );
                return;
              }
              const emitTime = Date.now();
              socket.emit("right", emitTime);
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
            if (!socket) {
              console.log(
                "trying to emit backward event to server but socket not open"
              );
              return;
            }
            const emitTime = Date.now();
            socket.emit("backward", emitTime);
          }}
        />
      </View>
      {/* </View> */}
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
    borderLeftWidth: 20,
    borderLeftColor: "transparent",
    borderRightWidth: 20,
    borderRightColor: "transparent",
    borderBottomWidth: 20,
    borderBottomColor: "#fff",
    marginTop: 15,
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
    borderTopWidth: 20,
    borderTopColor: "transparent",
    borderRightWidth: 20,
    borderRightColor: "#fff",
    borderBottomWidth: 20,
    borderBottomColor: "transparent",
    marginLeft: 15,
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
  btnDownContainer: {
    width: "100%",
    height: "30%",
    justifyContent: "flex-end",
    // backgroundColor: "orange"
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
    marginRight: "auto",
  },
});
JoystickLeft.propTypes = {
  socket: PropTypes.object.isRequired,
};
export default JoystickLeft;
