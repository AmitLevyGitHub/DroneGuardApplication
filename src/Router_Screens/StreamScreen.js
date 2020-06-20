import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  View,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
  TouchableOpacity
} from "react-native";
import { Modal, Button, Provider } from "@ant-design/react-native";
import { NodePlayerView, NodeCameraView } from "react-native-nodemediaclient";
import AsyncStorage from "@react-native-community/async-storage";
import {
  streamingDevice,
  AS,
  forceUpload,
  Screens,
  StyleConsts
} from "../Assets/consts";
import ConnectModal from "../Components/ConnectModal";
import JoystickRight from "../Components/JoystickRight";
import JoystickLeft from "../Components/JoystickLeft";
import useSocket from "../Hooks/useSocket";
import useTelemetry from "../Hooks/useTelemetry";
import useSaveStream from "../Hooks/useSaveStream";
import useScaleStream from "../Hooks/useScaleStream";
import useNavigateDrone from "../Hooks/useNavigateDrone";
import logger from "../logger";
const caller = "StreamScreen.js";

const StreamScreen = props => {
  const streamWidth = 1920;
  const streamHeight = 1080;
  const [socket] = useSocket();
  const [hasStarted, setHasStarted] = useState(false);
  const [droneTele, gpsTele] = useTelemetry(socket, hasStarted);
  useSaveStream(socket, hasStarted);
  const [scaledWidth, scaledHeight] = useScaleStream(streamWidth, streamHeight);
  const [audioRef, setAudioRef] = useState(null);
  const [droneOption, setDroneOption] = useState("takeoff");
  const [
    setAxisX,
    setAxisY,
    setNavCommand,
    isNavWorking,
    navModalVisible,
    setNavModalVisible,
    navModalTitle,
    navStatus
  ] = useNavigateDrone(socket, {
    scaledWidth,
    scaledHeight,
    centerCoordinate: { lat: gpsTele.latitude, lon: gpsTele.longitude },
    droneHeightCM: gpsTele.altitude,
    droneBearing: gpsTele.bearing
  });
  const [eventStartTime, setEventStartTime] = useState(-1);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);

  useEffect(() => {
    return async function cleanup() {
      try {
        await AsyncStorage.setItem(AS.uploadStatus, JSON.stringify([1]));
      } catch (e) {
        logger(
          "ERROR",
          e.message || e,
          caller,
          `AsyncStorage.setItem(${AS.uploadStatus}, )`
        );
      }
    };
  }, []);

  const wifiImageSource =
    droneTele.wifiIcon === 0
      ? require("../Assets/Icons/wifi0.png")
      : droneTele.wifiIcon === 1
      ? require("../Assets/Icons/wifi1.png")
      : droneTele.wifiIcon === 2
      ? require("../Assets/Icons/wifi2.png")
      : droneTele.wifiIcon === 3
      ? require("../Assets/Icons/wifi3.png")
      : require("../Assets/Icons/wifi0.png");

  const takoffLandIcon =
    droneOption === "takeoff"
      ? require("../Assets/Icons/takeoff_icon.png")
      : require("../Assets/Icons/landing_drone_White.png");

  const batteryImageSource = require("../Assets/Icons/battery.png");
  const logoImageSource = require("../Assets/Icons/logo.png");
  const lifeGuardAvatar = require("../Assets/StaticLifeGuards/man.jpg");

  const handlePressIn = () => {
    console.log("Press In");
    audioRef.start();
  };

  const handlePressOut = () => {
    console.log("Press Out");
    audioRef.stop();
  };

  const handleTakeOffLandToggle = () => {
    if (droneOption === "takeoff") {
      setNavCommand("takeoff");
      setDroneOption("land");
      logger("OPERATION", "takeoff", caller);
    } else {
      setNavCommand("land");
      setDroneOption("takeoff");
      logger("OPERATION", "land", caller);
    }
  };

  const handleScreenPress = e => {
    if (isNavWorking && navModalVisible) return;
    const axisX_res = e.nativeEvent.locationX - scaledWidth / 2;
    const axisY_res = (e.nativeEvent.locationY - scaledHeight / 2) * -1;
    setAxisX(axisX_res);
    setAxisY(axisY_res);
    logger("OPERATION", "press", caller);
  };

  const handleLogoPress = () => {
    if (forceUpload) {
      props.setScreen(Screens.upload);
    } else {
      props.setScreen(Screens.home);
    }
  };

  const handleEventToggle = () => {
    if (eventStartTime === -1) {
      setEventStartTime(Date.now());
      logger("DEV", "user starts event", caller);
    } else {
      props.setUserEvents(
        props.userEvents.concat({
          startTime: eventStartTime,
          endTime: Date.now()
        })
      );
      setEventStartTime(-1);
      logger("DEV", "user ends event", caller);
    }
  };

  const handleRelease = () => {
    setIsReleaseModalOpen(true);
  };

  const handleReleaseConfirm = () => {
    console.log(
      "here we are doing what we need to do in order to release life vest and save lives"
    );
    setIsReleaseModalOpen(false);
    global.releasedLiveVest = true;
  };
  return (
    <Provider>
      <View style={styles.container}>
        <ConnectModal socket={socket} setHasStarted={setHasStarted} />
        <Modal
          animationType="fade"
          transparent={true}
          visible={navModalVisible}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{navModalTitle}</Text>
                <TouchableOpacity onPress={() => setNavModalVisible(false)}>
                  <Text style={styles.closeButton}>X</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.modalStatus}>{navStatus}</Text>
              {isNavWorking && (
                <ActivityIndicator size="large" color="#0077be" />
              )}
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          transparent={true}
          visible={isReleaseModalOpen}
          style={styles.releaseModal}
        >
          <View>
            <Text style={styles.releaseText}>
              Are you sure you want to release the Life Vest?
            </Text>
            <Image
              style={{
                width: 200,
                height: 200,
                alignSelf: "center",
                marginTop: 15,
                marginBottom: 15
              }}
              source={require("../Assets/Icons/life_belt.png")}
            />
            <View style={styles.releaseButtonsContainer}>
              <Button
                style={styles.releaseButtons}
                onPress={handleReleaseConfirm}
              >
                Release
              </Button>
              <Button
                style={styles.releaseButtons}
                onPress={() => setIsReleaseModalOpen(false)}
              >
                Cancel
              </Button>
            </View>
          </View>
        </Modal>
        <TouchableWithoutFeedback onPress={handleScreenPress}>
          <NodePlayerView
            style={[
              styles.nodePlayerView,
              { width: scaledWidth, height: scaledHeight }
            ]}
            inputUrl={streamingDevice.url}
            scaleMode="ScaleAspectFit"
            bufferTime={100}
            maxBufferTime={1000}
            autoplay
            renderType="SURFACEVIEW"
          />
        </TouchableWithoutFeedback>
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <TouchableWithoutFeedback
              onPress={handleLogoPress}
              style={styles.zIndexStyle}
            >
              <Image source={logoImageSource} style={StyleConsts.logo} />
            </TouchableWithoutFeedback>
          </View>
          <View pointerEvents="none" style={styles.telemetryBox}>
            <Image source={wifiImageSource} style={styles.wifiIcon} />
            <Text style={styles.telemetryInfo}>{droneTele.batStatus}%</Text>
            <Image source={batteryImageSource} style={styles.batteryIcon} />
            <Text style={[styles.telemetryInfo, { marginBottom: 3 }]}>|</Text>
            <Text style={[styles.telemetryInfo, styles.height]}>
              {gpsTele.altitude ? parseFloat(gpsTele.altitude / 100) : 0}m
            </Text>
          </View>
          <View style={styles.buttonsPanel}>
            <TouchableOpacity style={styles.btn} onPress={handleEventToggle}>
              <View
                style={[
                  styles.eventButton,
                  {
                    borderColor: eventStartTime === -1 ? "white" : "red",
                    backgroundColor: eventStartTime === -1 ? "white" : "red"
                  }
                ]}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Text style={{ color: "white" }}>PTT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={handleRelease}
              disabled={global.releasedLiveVest}
            >
              <Text
                style={{
                  color: "white",
                  opacity: global.releasedLiveVest ? 0.5 : 1
                }}
              >
                RELEASE
              </Text>
            </TouchableOpacity>
            <Image source={lifeGuardAvatar} style={StyleConsts.avatar} />
          </View>
        </View>
        <JoystickRight setNavCommand={setNavCommand} />
        <JoystickLeft setNavCommand={setNavCommand} />
        <TouchableWithoutFeedback onPress={handleTakeOffLandToggle}>
          <Image source={takoffLandIcon} style={styles.landTakeoffButtons} />
        </TouchableWithoutFeedback>
      </View>
      <NodeCameraView
        style={{ height: 0, width: 0 }}
        ref={vb => setAudioRef(vb)}
        outputUrl={"rtmp://10.100.102.4:1935/live/audio"}
        camera={{ cameraId: 0, cameraFrontMirror: false }}
        audio={{ bitrate: 16000, profile: 1, samplerate: 44100 }}
        video={{
          preset: 12,
          bitrate: 100000,
          profile: 1,
          fps: 15,
          videoFrontMirror: false
        }}
        autopreview={true}
      />
    </Provider>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    position: "relative"
  },
  probingText: {
    fontSize: 60,
    color: "#ffffff",
    marginBottom: 50
  },
  activityIndicator: {
    transform: [{ scale: 2 }],
    marginTop: 20
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "rgba(66, 66, 66, 0.3)",
    zIndex: 100,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5
  },
  telemetryBox: {
    zIndex: 100,
    flexDirection: "row",
    width: 200,
    height: "100%",
    justifyContent: "space-around",
    alignItems: "flex-end"
  },
  telemetryInfo: {
    zIndex: 100,
    fontSize: 18,
    color: "white"
  },
  height: {
    fontSize: 20,
    includeFontPadding: false,
    textAlignVertical: "bottom"
  },
  joysticksRow: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    width: "100%",
    position: "absolute",
    bottom: 0,
    left: 0,
    zIndex: 10,
    marginBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 5,
    paddingBottom: 5
  },
  actionButtons: {
    flexDirection: "row",
    flex: 1
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    display: "flex",
    justifyContent: "center",
    width: 360,
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalHeader: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold"
  },
  closeButton: {
    fontSize: 25
  },
  modalStatus: {
    fontSize: 15,
    marginBottom: 10
  },
  recBtn: {
    backgroundColor: "red",
    width: 25,
    height: 25,
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "red",
    borderRadius: 50
  },
  btn: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#ccc",
    borderRadius: 50
  },
  landTakeoffButtons: {
    width: 512 / 4,
    height: 512 / 4,
    zIndex: 100,
    position: "absolute",
    left: "50%",
    transform: [{ translateX: -50 }],
    bottom: 0
  },
  nodePlayerView: {
    position: "absolute",
    bottom: 0,
    backgroundColor: "black",
    zIndex: 5
  },
  eventButton: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 50
  },
  batteryIcon: {
    width: 13 / 1.1,
    height: 24 / 1.1,
    marginLeft: -6,
    marginBottom: 3
  },
  wifiIcon: { width: 920 / 14, height: 392 / 14 },
  buttonsPanel: {
    display: "flex",
    flexDirection: "row",
    width: 250,
    justifyContent: "space-between"
  },
  logoContainer: {
    width: 250
  },
  releaseModal: {
    width: StyleConsts.modal.width,
    height: StyleConsts.modal.height,
    display: "flex",
    alignItems: "center"
  },
  releaseText: {
    fontSize: 30,
    textAlign: "center"
  },
  releaseButtonsContainer: {
    display: "flex",
    flexDirection: "row",
    width: "100%"
  },
  releaseButtons: {
    marginLeft: 5,
    marginRight: 5,
    flex: 1,
    alignSelf: "flex-end",
    marginBottom: 10,
    borderRadius: 30
  }
});

StreamScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
  setUserEvents: PropTypes.func.isRequired,
  userEvents: PropTypes.array
};
export default StreamScreen;
