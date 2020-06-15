//
import React from "react";
import PropTypes from "prop-types";
import {
  View,
  StyleSheet,
  Image,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Modal,
} from "react-native";
import { NodePlayerView } from "react-native-nodemediaclient";
import AsyncStorage from "@react-native-community/async-storage";
//
import { streamingDevice, S, AS, forceUpload } from "../Assets/consts";
import StartModal from "../Components/StartModal";
import JoystickRight from "../Components/JoystickRight";
import JoystickLeft from "../Components/JoystickLeft";
import useSocket from "../Hooks/useSocket";
import useTelemetry from "../Hooks/useTelemetry";
import useSaveStream from "../Hooks/useSaveStream";
import useScaleStream from "../Hooks/useScaleStream";
import useNavigateDrone from "../Hooks/useNavigateDrone";
//
const StreamScreen = (props) => {
  const streamWidth = 1920;
  const streamHeight = 1080;
  //socket
  const [socket] = useSocket();
  //start stream & telemetry
  const [hasStarted, setHasStarted] = React.useState(false);
  const [droneTele, gpsTele] = useTelemetry(socket, hasStarted);
  const [errorOccurred] = useSaveStream(socket, hasStarted);
  const [scaledWidth, scaledHeight] = useScaleStream(streamWidth, streamHeight);
  const [myRef, setMyRef] = React.useState(null);
  //navigation handler
  const [droneOption, setDroneOption] = React.useState("takeoff");
  const [
    setAxisX,
    setAxisY,
    setNavCommand,
    isNavWorking,
    navModalVisible,
    setNavModalVisible,
    navModalTitle,
    navStatus,
  ] = useNavigateDrone(socket, {
    scaledWidth,
    scaledHeight,
    centerCoordinate: { lat: gpsTele.latitude, lon: gpsTele.longitude },
    droneHeightCM: gpsTele.altitude,
    droneBearing: gpsTele.bearing,
  });
  /**
   * StreamScreen cleanup
   * on exit mark in async storage so user must upload data before using again
   */
  React.useEffect(() => {
    return async function cleanup() {
      //RNFFMPEG.cancel()?
      try {
        await AsyncStorage.setItem(AS.uploadStatus, JSON.stringify([1]));
      } catch (e) {
        // saving error
        const m = `error setting ${AS.uploadStatus} to true! Stream UI will not be blocked\n${e.message}`;
        console.log(m);
      }
    };
  }, []);
  //
  return (
    <View style={styles.container}>
      {/** start modal */}
      <StartModal socket={socket} setHasStarted={setHasStarted} />
      {/** Navigation & Feedback modal */}
      <Modal animationType="fade" transparent={true} visible={navModalVisible}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{navModalTitle}</Text>
              <TouchableOpacity onPress={() => setNavModalVisible(false)}>
                <Text style={styles.closeButton}>X</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalStatus}>{navStatus}</Text>
            {isNavWorking && <ActivityIndicator size="large" color="#0077be" />}
          </View>
        </View>
      </Modal>
      {/** Video Stream component + touch handler */}
      <TouchableWithoutFeedback
        onPress={(e) => {
          // if (!hasStarted) return;
          if (isNavWorking && navModalVisible) return;
          const axisX_res = e.nativeEvent.locationX - scaledWidth / 2;
          const axisY_res = (e.nativeEvent.locationY - scaledHeight / 2) * -1;
          setAxisX(axisX_res);
          setAxisY(axisY_res);
        }}
      >
        <NodePlayerView
          style={{
            position: "absolute",
            bottom: 0,
            backgroundColor: "black",
            width: scaledWidth,
            height: scaledHeight,
            zIndex: 5,
          }}
          ref={(vp) => setMyRef(vp)}
          inputUrl={streamingDevice.url}
          scaleMode="ScaleAspectFit"
          bufferTime={100}
          maxBufferTime={1000}
          autoplay
          // onStatus={() => console.log("on status func")}
          renderType="SURFACEVIEW"
        />
      </TouchableWithoutFeedback>
      {/*<View*/}
      {/*  style={{*/}
      {/*    position: "absolute",*/}
      {/*    bottom: 0,*/}
      {/*    width: 900,*/}
      {/*    height: 600,*/}
      {/*    backgroundColor: "red"*/}
      {/*  }}*/}
      {/*>*/}
      <View style={styles.header}>
        {/** Home Screen Button */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (forceUpload) {
              props.setScreen(S.upload);
            } else {
              props.setScreen(S.home);
            }
          }}
          style={{ zIndex: 100 }}
        >
          <Image
            source={require("../Assets/Icons/logo.png")}
            style={{ width: 490 / 10, height: 367 / 10 }}
          />
        </TouchableWithoutFeedback>
        {/** Telemetry Feedback */}
        <View pointerEvents="none" style={styles.telemetryBox}>
          <Image
            source={
              droneTele.wifiIcon === 0
                ? require("../Assets/Icons/wifi0.png")
                : droneTele.wifiIcon === 1
                ? require("../Assets/Icons/wifi1.png")
                : droneTele.wifiIcon === 2
                ? require("../Assets/Icons/wifi2.png")
                : droneTele.wifiIcon === 3
                ? require("../Assets/Icons/wifi3.png")
                : require("../Assets/Icons/wifi0.png")
            }
            style={{ width: 920 / 26, height: 392 / 26 }}
          />
          <Text style={styles.telemetryInfo}>{droneTele.batStatus}%</Text>
          <Image
            source={require("../Assets/Icons/battery.png")}
            style={{
              width: 13 / 2,
              height: 24 / 2,
              backgroundSize: "cover",
              marginLeft: -4,
            }}
          />
          <Text style={styles.telemetryInfo}>|</Text>
          <Text style={[styles.telemetryInfo, styles.height]}>
            {gpsTele.altitude ? parseFloat(gpsTele.altitude / 100) : 0}m
          </Text>
        </View>
        {/** "command" */}
        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            borderRadius: 50,
            borderStyle: "solid",
            borderColor: "#fff",
            borderWidth: 1,
            // marginRight: 10,
            position: "absolute",
            right: 55,
            top: 9,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setNavCommand("command")}
        >
          <Text style={{ color: "#fff" }}>C</Text>
        </TouchableOpacity>
        {/** "emergency" */}
        <TouchableOpacity
          style={{
            width: 30,
            height: 30,
            borderRadius: 50,
            borderStyle: "solid",
            borderColor: "#fff",
            borderWidth: 1,
            // marginRight: 10,
            position: "absolute",
            right: 95,
            top: 9,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => setNavCommand("emergency")}
        >
          <Text style={{ color: "#fff" }}>E</Text>
        </TouchableOpacity>
        {/** user image */}
        <Image
          source={require("../Assets/StaticLifeGuards/man.jpg")}
          style={{
            width: 30,
            height: 30,
            borderRadius: 50,
          }}
        />
      </View>
      {/** joysticks */}
      <JoystickRight setNavCommand={setNavCommand} />
      <JoystickLeft setNavCommand={setNavCommand} />
      {/** land / takeoff */}
      <TouchableWithoutFeedback
        onPress={() => {
          if (droneOption === "takeoff") {
            setNavCommand("takeoff");
            setDroneOption("land");
          } else {
            setNavCommand("land");
            setDroneOption("takeoff");
          }
        }}
      >
        <Image
          source={
            droneOption === "takeoff"
              ? require("../Assets/Icons/takeoff_icon.png")
              : require("../Assets/Icons/landing_drone_White.png")
          }
          style={{
            width: 512 / 7,
            height: 512 / 7,
            zIndex: 100,
            position: "absolute",
            left: 307,
            bottom: 0,
          }}
        />
      </TouchableWithoutFeedback>

      {/*</View>*/}
      {/*  /!** Home Indication *!/*/}
      {/*<View*/}
      {/*  style={{*/}
      {/*    position: "absolute",*/}
      {/*    top: scaledHeight / 2,*/}
      {/*    left: scaledWidth / 2,*/}
      {/*    zIndex: 100*/}
      {/*  }}*/}
      {/*  pointerEvents="none"*/}
      {/*>*/}
      {/*  <Text>O</Text>*/}
      {/*</View>*/}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  probingText: {
    fontSize: 60,
    color: "#ffffff",
    marginBottom: 50,
  },
  activityIndicator: {
    transform: [{ scale: 2 }],
    marginTop: 20,
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
    paddingBottom: 5,
  },
  telemetryBox: {
    zIndex: 100,
    flexDirection: "row",
    width: "20%",
    height: "100%",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },
  telemetryInfo: {
    zIndex: 100,
    fontSize: 10,
    color: "white",
  },
  height: {
    fontSize: 12,
    lineHeight: 13,
    includeFontPadding: false,
    textAlignVertical: "bottom",
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
    paddingBottom: 5,
    // backgroundColor: "red"
  },
  actionButtons: {
    flexDirection: "row",
    flex: 1,
  },
  //modal
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
  modalHeader: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    fontSize: 25,
  },
  modalStatus: {
    fontSize: 15,
    marginBottom: 10,
  },
});

StreamScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};
export default StreamScreen;
