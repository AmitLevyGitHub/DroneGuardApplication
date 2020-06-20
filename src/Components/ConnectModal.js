import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image
} from "react-native";
import { Modal, Button, Provider } from "@ant-design/react-native";
import logger from "../logger";
const caller = "ConnectModal.js";
const closableWaitTime = 3000;
const autoCloseTimeWhenFinished = 15000;
const errorTimeOut = 20000;

const ConnectModal = props => {
  const { socket, setHasStarted } = props;
  const [requestStart, setRequestStart] = useState(false);
  const [startModalVisible, setStartModalVisible] = useState(true);
  const [startButtonTitle, setStartButtonTitle] = useState("Connect");
  const [isStartWorking, setIsStartWorking] = useState(false);
  const [startStatus, setStartStatus] = useState("Connect to drone");
  const [startModalClosable, setClosable] = useState(false);

  useEffect(() => {
    if (!socket) return;
    let isSubscribed = true;
    let autoCloseTimeout = null;
    socket.on("startFinished", startData => {
      setIsStartWorking(false);
      setClosable(true);
      if (startData.status) {
        logger("DEV", startData.message, caller, "socket.on(startFinished)");
        setHasStarted(true);
        isSubscribed && setStartModalVisible(false);
      } else {
        logger("ERROR", startData.message, caller, "socket.on(startFinished)");
        setStartButtonTitle("Try Again");
        setStartStatus("Error connecting to drone");
        setRequestStart(false);
      }
    });

    return function cleanup() {
      isSubscribed = false;
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
      socket.off("startFinished");
    };
  }, [socket]);

  useEffect(() => {
    if (!requestStart) return;
    if (!socket.connected) {
      logger(
        "WARNING",
        "trying to emit but socket not connected",
        caller,
        "socket.emit(start)"
      );
      setStartStatus("Error connecting to drone");
      setStartButtonTitle("Try Again");
      setClosable(true);
      setRequestStart(false);
      return;
    }
    let isSubscribed = true;
    setStartStatus("Connecting...");
    setIsStartWorking(true);
    socket.emit("start");
    logger("DEV", "socket.emit(start)", caller);

    const timeOutTimeout = setTimeout(() => {
      if (isSubscribed) {
        const errorTimeOutSeconds = (errorTimeOut / 1000).toFixed(0);
        logger(
          "WARNING",
          `timeout after ${errorTimeOutSeconds}, no response received`,
          caller,
          "socket.emit(start)"
        );
        setClosable(true);
        setIsStartWorking(false);
        setStartButtonTitle("Try Again");
        setStartStatus(
          `No response received from server after ${errorTimeOutSeconds}`
        );
        setRequestStart(false);
      }
    }, errorTimeOut);

    const closeableTimeout = setTimeout(() => {
      isSubscribed && setClosable(true);
    }, closableWaitTime);
    return function cleanup() {
      isSubscribed = false;
      if (closeableTimeout) clearTimeout(closeableTimeout);
      if (timeOutTimeout) clearTimeout(timeOutTimeout);
    };
  }, [requestStart]);

  return (
    <Provider>
      <Modal
        animationType="fade"
        transparent={true}
        visible={startModalVisible}
        style={styles.modal}
        closable={startModalClosable}
        onClose={() => setStartModalVisible(false)}
      >
        <View style={styles.connectModalContent}>
          <Image
            source={require("../Assets/Icons/connection_icon.png")}
            style={{ width: 170, height: 100 }}
          />
          <View style={styles.textAndButton}>
            {startStatus && <Text style={styles.status}>{startStatus}</Text>}
            {isStartWorking ? (
              <ActivityIndicator size="large" color="#000" />
            ) : (
              <Button
                style={styles.connectButton}
                onPress={() => setRequestStart(true)}
              >
                {startButtonTitle}
              </Button>
            )}
          </View>
        </View>
      </Modal>
    </Provider>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "bold"
  },
  closeButton: {
    fontSize: 25
  },
  status: {
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center"
  },
  modal: {
    width: 500,
    height: 200
  },
  connectButton: {
    borderRadius: 30,
    width: 150
  },
  connectModalContent: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: "100%"
  },
  textAndButton: {
    marginLeft: 20,
    display: "flex",
    alignItems: "center"
  }
});

ConnectModal.propTypes = {
  socket: PropTypes.object,
  setHasStarted: PropTypes.func.isRequired
};
export default ConnectModal;
