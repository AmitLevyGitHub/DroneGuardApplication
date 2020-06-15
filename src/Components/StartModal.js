import React from "react";
import PropTypes from "prop-types";
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Button,
  StyleSheet,
} from "react-native";
//
const closableWaitTime = 3000;
const autoCloseTimeWhenFinished = 15000;
const errorTimeOut = 20000;
//
const StartModal = (props) => {
  const { socket, setHasStarted } = props;
  const [requestStart, setRequestStart] = React.useState(false);
  const [startModalVisible, setStartModalVisible] = React.useState(true);
  const [startButtonTitle, setStartButtonTitle] = React.useState("Start");
  const [startModalTitle, setStartModalTitle] = React.useState(
    "Please Startup"
  );
  const [isStartWorking, setIsStartWorking] = React.useState(false);
  const [startStatus, setStartStatus] = React.useState(
    "Click on the button to start streaming\nand save current GPS position"
  );
  const [startModalClosable, setClosable] = React.useState(false);
  /**
   * socket callback- called when startFinished emitted from server
   * auto close modal after specific time (must be done with explicit state change)
   */
  React.useEffect(() => {
    if (!socket) return; // if (!socket.connected) return;
    let isSubscribed = true;
    let autoCloseTimeout = null;
    socket.on("startFinished", (startData) => {
      const startDataStringified = JSON.stringify(startData, null, 2);
      console.log(`startFinished with startData = ${startDataStringified}`);
      setIsStartWorking(false);
      setClosable(true);
      if (startData.status) {
        setStartModalTitle("Startup finished");
        setStartButtonTitle("Continue");
        setStartStatus(startData.message);
        setHasStarted(true);
      } else {
        setStartModalTitle("Startup error");
        setStartButtonTitle("Start Again");
        setStartStatus(
          startData.message + "\nPlease try again and do not exit this popup"
        );
        setRequestStart(false);
      }
      //auto close
      autoCloseTimeout = setTimeout(() => {
        isSubscribed && setStartModalVisible(false);
      }, autoCloseTimeWhenFinished);
    });
    return function cleanup() {
      isSubscribed = false;
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
    };
  }, [socket]);
  /**
   * emit 'start' event to server
   * UI is blocked until 'startFinished' received
   * or until specific time passes and modal is closable
   */
  React.useEffect(() => {
    if (!requestStart) return;
    if (!socket.connected) {
      setStartModalTitle("No Connection");
      setStartStatus(
        "Socket to server not opened\nPlease try again and do not exit this popup\nIf you exit this popup without connection the app won't be responsive"
      );
      setStartButtonTitle("Try Again");
      setClosable(true);
      setRequestStart(false);
      return;
    }
    let isSubscribed = true;
    setStartModalTitle("Starting up");
    setIsStartWorking(true);
    setStartStatus(null);
    socket.emit("start");
    //
    const timeOutTimeout = setTimeout(() => {
      if (isSubscribed) {
        setClosable(true);
        setIsStartWorking(false);
        setStartModalTitle("Startup Timeout");
        const errorTimeOutSeconds = (errorTimeOut / 1000).toFixed(0);
        setStartButtonTitle("Start Again");
        setStartStatus(
          `No response received from server after ${errorTimeOutSeconds}`
        );
        setRequestStart(false);
      }
    }, errorTimeOut);
    //
    const closeableTimeout = setTimeout(() => {
      isSubscribed && setClosable(true);
    }, closableWaitTime);
    return function cleanup() {
      isSubscribed = false;
      if (closeableTimeout) clearTimeout(closeableTimeout);
      if (timeOutTimeout) clearTimeout(timeOutTimeout);
    };
  }, [requestStart]);
  //
  return (
    <Modal animationType="fade" transparent={true} visible={startModalVisible}>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.title}>{startModalTitle}</Text>
            {startModalClosable && (
              <TouchableOpacity onPress={() => setStartModalVisible(false)}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            )}
          </View>
          {startStatus && <Text style={styles.status}>{startStatus}</Text>}
          {isStartWorking ? (
            <ActivityIndicator size="large" color="#0077be" />
          ) : (
            <Button
              title={startButtonTitle}
              onPress={() => setRequestStart(true)}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};
//
const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  modalView: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 360,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 25,
  },
  status: {
    fontSize: 15,
    marginBottom: 10,
  },
});
//
StartModal.propTypes = {
  socket: PropTypes.object,
  setHasStarted: PropTypes.func.isRequired,
};
export default StartModal;
