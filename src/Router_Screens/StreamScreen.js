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
} from "react-native";
import { Provider, Modal } from "@ant-design/react-native";
// import Icon from "react-native-vector-icons/FontAwesome5";
// import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
import { NodePlayerView } from "react-native-nodemediaclient";
import AsyncStorage from "@react-native-community/async-storage";
//
import useSaveStream from "../Hooks/useSaveStream";
import useProbeStream from "../Hooks/useProbeStream";
import useScaleStream from "../Hooks/useScaleStream";
import useSocket from "../Hooks/useSocket";
import useTelemetry from "../Hooks/useTelemetry";
import useNavigateDrone from "../Hooks/useNavigateDrone";
import { streamingDevice, S, AS, forceUpload } from "../Assets/consts";
import JoystickRight from "../Joystick/JoystickRight";
import JoystickLeft from "../Joystick/JoystickLeft";

const StreamScreen = (props) => {
  //socket
  const [socket] = useSocket();
  //telemetry
  const [droneTele, gpsTele] = useTelemetry(socket);
  //stream
  const [myRef, setMyRef] = React.useState(null);
  const [errorOccurred] = useSaveStream(socket);
  const [
    isProbing,
    streamWidth,
    streamHeight,
    probeModalClosable,
  ] = useProbeStream(errorOccurred);
  const [probeModalVisible, setProbeModalVisible] = React.useState(true);
  const [droneOption, setDroneOption] = React.useState("takeoff");
  const [navigatingModalVisible, setNavigatingModalVisible] = React.useState(
    true
  );
  const [scaledWidth, scaledHeight] = useScaleStream(streamWidth, streamHeight);
  //navigation handler
  const [
    setAxisX,
    setAxisY,
    isNavigating,
    showNavStatus,
    navigationStatus,
    navigatingModalClosable,
    setNavCommand,
  ] = useNavigateDrone(socket, {
    scaledWidth,
    scaledHeight,
    centerCoordinate: { lat: gpsTele.latitude, lon: gpsTele.longitude },
    droneHeightCM: gpsTele.altitude,
    droneBearing: gpsTele.bearing,
  });
  //navigation status feedback, allowing the user to close it
  const [isStatusModal, setIsStatusModal] = React.useState(true);
  //
  //on exit mark in async storage so user must upload data before using again
  React.useEffect(() => {
    return async function cleanup() {
      //RNFFMPEG.cancel()?
      try {
        await AsyncStorage.setItem(AS.uploadStatus, JSON.stringify([1]));
      } catch (e) {
        // saving error
        console.log(
          `error setting ${AS.uploadStatus} to true! Stream UI will not be blocked\n${e.message}`
        );
      }
    };
  }, []);
  //
  return (
    <Provider>
      <View style={styles.container}>
        {/** video loading modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isProbing && probeModalVisible}
          closable={probeModalClosable}
          maskClosable={false}
          title="Connecting To Drone Camera"
          style={{ minWidth: 360 }}
          onClose={() => {
            console.log("probe modal on close");
            setProbeModalVisible(false);
          }}
        >
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator
              size="large"
              color="#0077be"
              style={styles.activityIndicator}
            />
          </View>
        </Modal>
        {/*/!** Video Stream component + touch handler *!/*/}
        <TouchableWithoutFeedback
          onPress={(e) => {
            if (isNavigating && navigatingModalVisible) return;
            if (isProbing && probeModalVisible) return;
            // if (isNavigating || isProbing) return; //disable press input when navigation is happening!
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
          {/** Height indication */}
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
          <Image
            source={require("../Assets/StaticLifeGuards/man.jpg")}
            style={{
              width: 30,
              height: 30,
              borderRadius: 50,
            }}
          />
        </View>

        <JoystickRight setNavCommand={setNavCommand} />
        <JoystickLeft setNavCommand={setNavCommand} />
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
        {/*  /!** Navigation in process Modal *!/*/}
        <Modal
          animationType="fade"
          transparent={true}
          closable={navigatingModalClosable}
          maskClosable={false}
          visible={isNavigating && navigatingModalVisible}
          title="Navigating"
          onClose={() => setNavigatingModalVisible(false)}
        >
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="large" color="#0077be" />
          </View>
        </Modal>
        {/*  /!** Feedback Modal *!/*/}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showNavStatus && isStatusModal}
          closable
          maskClosable
          onClose={() => setIsStatusModal(false)}
          onRequestClose={() => setIsStatusModal(false)}
          title={
            navigationStatus.status ? "Navigation Success" : "Navigation Failed"
          }
        >
          <View style={{ paddingVertical: 20 }}>
            <Text>start time in ms: {navigationStatus.startTime}</Text>
            <Text>finish time in ms: {navigationStatus.finishTime}</Text>
            <Text>Total time in ms: {navigationStatus.navigationTime}</Text>
            <Text>Total distance: {navigationStatus.totalDistance}</Text>
            <Text>
              Final coordinate reached: (
              {navigationStatus.reachedCoordinate.lat},{" "}
              {navigationStatus.reachedCoordinate.lon})
            </Text>
            {navigationStatus.reasons.map((reason, i) => (
              <Text key={i}>{reason}</Text>
            ))}
          </View>
        </Modal>
        {/*</View>*/}
      </View>
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
});

StreamScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};
export default StreamScreen;
