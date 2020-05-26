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
import Icon from "react-native-vector-icons/FontAwesome5";
import Icon2 from "react-native-vector-icons/MaterialCommunityIcons";
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
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "#0077be",
    justifyContent: "center",
    alignItems: "center",
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
});
//
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
      try {
        await AsyncStorage.setItem(
          AS.uploadStatus,
          JSON.stringify({ interrupted: true })
        );
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
        {/** Video Stream component + touch handler */}
        <TouchableWithoutFeedback
          onPress={(e) => {
            if (isNavigating && navigatingModalVisible) return;
            if (isProbing && probeModalVisible) return;
            // if (isNavigating || isProbing) return; //disable press input when navigation is happening!
            const axisX_res = e.nativeEvent.locationX - scaledWidth / 2;
            const axisY_res = (e.nativeEvent.locationY - scaledHeight / 2) * -1;
            setAxisX(axisX_res);
            setAxisY(axisY_res);
            console.log(`
                  absoluteX = ${e.nativeEvent.locationX}
                  absoluteY = ${e.nativeEvent.locationY}
                  axisX = ${axisX_res}
                  axisY = ${axisY_res}
                `);
          }}
        >
          <NodePlayerView
            style={{
              position: "absolute",
              bottom: 0,
              backgroundColor: "#B6DCE9",
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
            onStatus={() => console.log("on status func")}
            renderType="SURFACEVIEW"
          />
        </TouchableWithoutFeedback>
        {/** Main UI */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: scaledWidth,
            height: scaledHeight,
          }}
        >
          {/** First Row */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              position: "absolute",
              top: 0,
              left: 0,
              paddingTop: 20,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              zIndex: 100,
            }}
          >
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
              <View
                style={{
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  alignContent: "center",
                }}
              >
                <Image
                  source={require("../Assets/Icons/logo.png")}
                  style={{ width: 490 / 6, height: 367 / 6 }}
                />
                <Image
                  source={require("../Assets/StaticLifeGuards/man.jpg")}
                  style={{
                    width: 417 / 10, //626
                    height: 417 / 10,
                    borderRadius: 417 / 10 / 2,
                    overflow: "hidden",
                    borderWidth: 0.5,
                    borderColor: "white",
                    marginLeft: 8,
                    marginRight: 8,
                  }}
                />
              </View>
            </TouchableWithoutFeedback>
            {/** Battery indication */}
            <View pointerEvents="none" style={{ zIndex: 100 }}>
              <Text style={{ zIndex: 100, fontSize: 30, color: "white" }}>
                {gpsTele.altitude}m
              </Text>
            </View>
            {/** Drone telemetry */}
            <View
              pointerEvents="none"
              style={{
                zIndex: 100,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                alignContent: "center",
                paddingRight: 4,
              }}
            >
              <React.Fragment>
                <Text
                  style={{
                    zIndex: 100,
                    fontSize: 15,
                    color: "white",
                    marginRight: -8,
                  }}
                >
                  {droneTele.batStatus}%
                </Text>
                <Icon
                  style={{ transform: [{ rotate: "-90deg" }] }}
                  name={droneTele.batIcon}
                  solid
                  color="white"
                  size={30}
                />
              </React.Fragment>
              {droneTele.wifiIcon === 0 && (
                <Image
                  source={require("../Assets/Icons/wifi0.png")}
                  style={{ width: 920 / 10, height: 392 / 10 }}
                />
              )}
              {droneTele.wifiIcon === 1 && (
                <Image
                  source={require("../Assets/Icons/wifi1.png")}
                  style={{ width: 920 / 10, height: 392 / 10 }}
                />
              )}
              {droneTele.wifiIcon === 2 && (
                <Image
                  source={require("../Assets/Icons/wifi2.png")}
                  style={{ width: 920 / 10, height: 392 / 10 }}
                />
              )}
              {droneTele.wifiIcon === 3 && (
                <Image
                  source={require("../Assets/Icons/wifi3.png")}
                  style={{ width: 920 / 10, height: 392 / 10 }}
                />
              )}
              <Icon name="map-marker-alt" solid color="white" size={30} />
            </View>
          </View>
          {/** Last Row */}
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
              position: "absolute",
              bottom: 0,
              left: 0,
              zIndex: 100,
              marginBottom: 10,
            }}
          >
            {/** 2D navigation pad */}
            <JoystickLeft setNavCommand={setNavCommand} />
            {/** Land */}
            <TouchableWithoutFeedback
              style={{ zIndex: 100 }}
              onPress={() => setNavCommand("land")}
            >
              <Image
                source={require("../Assets/Icons/backHome.png")}
                style={{
                  width: 512 / 7,
                  height: 512 / 7,
                  // backgroundColor: "rgba(0, 0, 0, 0.3)",
                }}
              />
            </TouchableWithoutFeedback>
            {/** takeoff */}
            <TouchableOpacity onPress={() => setNavCommand("takeoff")}>
              <Text
                style={{
                  backgroundColor: "white",
                  color: "black",
                  fontSize: 20,
                }}
              >
                TAKEOFF
              </Text>
            </TouchableOpacity>
            {/** emergency */}
            <TouchableOpacity onPress={() => setNavCommand("emergency")}>
              <Text
                style={{
                  backgroundColor: "white",
                  color: "black",
                  fontSize: 20,
                }}
              >
                EMERGENCY
              </Text>
            </TouchableOpacity>
            {/** command */}
            <TouchableOpacity onPress={() => setNavCommand("command")}>
              <Text
                style={{
                  backgroundColor: "white",
                  color: "black",
                  fontSize: 20,
                }}
              >
                COMMAND
              </Text>
            </TouchableOpacity>
            {/** 3D navigation pad */}
            <JoystickRight setNavCommand={setNavCommand} />
          </View>
          {/** Home Indication */}
          <View
            style={{
              position: "absolute",
              top: scaledHeight / 2,
              left: scaledWidth / 2,
              zIndex: 100000,
            }}
            pointerEvents="none"
          >
            <Icon2 name="target" color="white" solid size={50} />
          </View>
          {/** Navigation in process Modal */}
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
          {/** Feedback Modal */}
          <Modal
            animationType="fade"
            transparent={true}
            visible={showNavStatus && isStatusModal}
            closable
            maskClosable
            onClose={() => setIsStatusModal(false)}
            onRequestClose={() => setIsStatusModal(false)}
            title={
              navigationStatus.status
                ? "Navigation Success"
                : "Navigation Failed"
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
        </View>
      </View>
    </Provider>
  );
};
//
StreamScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};
export default StreamScreen;