//
import React from "react";
import PropTypes from "prop-types";
import {
  View,
  StyleSheet,
  Button,
  Dimensions,
  Text,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { Provider, Modal } from "@ant-design/react-native";
import { IconFill } from "@ant-design/icons-react-native";
import KeepAwake from "react-native-keep-awake";
import { NodePlayerView } from "react-native-nodemediaclient";
//
import useDroneData from "../Hooks/useDroneData";
import useSaveStream from "../Hooks/useSaveStream";
import useProbeStream from "../Hooks/useProbeStream";
import useScaleStream from "../Hooks/useScaleStream";
import useNavigateDrone from "../Hooks/useNavigateDrone";
import { streamURL } from "../Assets/consts";
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
    transform: [{ scale: 3 }],
  },
});
//
const StreamUI = (props) => {
  //
  React.useEffect(() => {
    KeepAwake.activate();
    return function cleanup() {
      KeepAwake.deactivate();
    };
  }, []);
  //drone
  const [droneHeightCM, centerCoordinate, droneBearing] = useDroneData();
  //stream
  const [myRef, setMyRef] = React.useState(null);
  const [errorOccurred] = useSaveStream();
  const [isProbing, streamWidth, streamHeight] = useProbeStream(errorOccurred);
  const [scaledWidth, scaledHeight] = useScaleStream(streamWidth, streamHeight);
  //navigation handler
  const [
    setAxisX,
    setAxisY,
    isNavigating,
    showNavStatus,
    navigationStatus,
  ] = useNavigateDrone({
    scaledWidth,
    scaledHeight,
    centerCoordinate,
    droneHeightCM,
    droneBearing,
  });
  //navigation status feedback, allow the user to close it
  const [isStatusModal, setIsStatusModal] = React.useState(true);
  //
  // console.log(`
  //   showNavStatus = ${showNavStatus.toString()}
  //   isStatusModal = ${isStatusModal.toString()}
  // `);
  return (
    <Provider>
      <View style={styles.container}>
        {isProbing && (
          <React.Fragment>
            <Text style={styles.probingText}>
              Probing the video stream, please wait
            </Text>
            <ActivityIndicator
              size="large"
              color="#ffffff"
              style={styles.activityIndicator}
            />
          </React.Fragment>
        )}
        {!isProbing && (
          <React.Fragment>
            {/** Video Stream component + touch handler */}
            <TouchableWithoutFeedback
              onPress={(e) => {
                if (isNavigating) return; //disable press input when navigation is happening!
                const axisX_res = e.nativeEvent.locationX - scaledWidth / 2;
                const axisY_res =
                  (e.nativeEvent.locationY - scaledHeight / 2) * -1;
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
                  // position: "absolute",
                  backgroundColor: "#B6DCE9",
                  // bottom: 0,
                  // left: 0,
                  width: scaledWidth,
                  height: scaledHeight,
                  zIndex: 5,
                }}
                ref={(vp) => setMyRef(vp)}
                inputUrl={streamURL}
                scaleMode="ScaleAspectFit"
                bufferTime={100}
                maxBufferTime={1000}
                autoplay
                // onStatus={() => console.log("on status func")}
                renderType="SURFACEVIEW"
              />
            </TouchableWithoutFeedback>
            {/** Main UI */}
            <View
              style={{
                position: "absolute",
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
                  width: "100%",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              >
                {/** Settings Screen */}
                <TouchableWithoutFeedback
                  onPress={() => props.setScreen("welcome")}
                  style={{ zIndex: 100 }}
                >
                  <Text style={{ zIndex: 100, backgroundColor: "#ffffff" }}>
                    DroneGuard logo, LifeGuard Avatar, Settings Icon
                  </Text>
                </TouchableWithoutFeedback>
                {/** Battery indication */}
                <View pointerEvents="none" style={{ zIndex: 100 }}>
                  <Text style={{ zIndex: 100, backgroundColor: "#ffffff" }}>
                    Battery Indication
                  </Text>
                </View>
                {/** Another button */}
                <View pointerEvents="none" style={{ zIndex: 100 }}>
                  <Text style={{ zIndex: 100, backgroundColor: "#ffffff" }}>
                    GPS icon, wifi signal icon, battery status
                  </Text>
                </View>
              </View>
              {/** Last Row */}
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  width: "100%",
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                }}
              >
                <TouchableWithoutFeedback
                  style={{ zIndex: 100 }}
                  onPress={() => console.log("nav1")}
                >
                  <Text style={{ zIndex: 100, backgroundColor: "#ffffff" }}>
                    nav1
                  </Text>
                </TouchableWithoutFeedback>

                <TouchableWithoutFeedback
                  style={{ zIndex: 100 }}
                  onPress={() => console.log("Emergency Land")}
                >
                  <Text style={{ zIndex: 100, backgroundColor: "#ffffff" }}>
                    Emergency Land
                  </Text>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  style={{ zIndex: 100 }}
                  onPress={() => console.log("nav2")}
                >
                  <Text style={{ zIndex: 100, backgroundColor: "#ffffff" }}>
                    nav2
                  </Text>
                </TouchableWithoutFeedback>
              </View>
              {/** Home Indication */}
              <View
                style={{
                  position: "absolute",
                  top: scaledWidth / 2,
                  left: scaledHeight / 2,
                  zIndex: 100,
                  backgroundColor: "#ffffff",
                }}
                pointerEvents="none"
              >
                <Text>Home Dot</Text>
              </View>
              {/** Navigation in process Modal */}
              <Modal
                animationType="fade"
                transparent={true}
                visible={isNavigating}
                title="Navigating"
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
                  <Text>Total time: {navigationStatus.navigationTime}</Text>
                  <Text>Total distance: {navigationStatus.totalDistance}</Text>
                  <Text>
                    Final coordinate reached: (
                    {navigationStatus.reachedCoordinate.lat},{" "}
                    {navigationStatus.reachedCoordinate.lon})
                  </Text>
                  {/*navigationStatus.reasons.map((reason) => (
                    <Text>{reason}</Text>
                  ))*/}
                </View>
              </Modal>
            </View>
          </React.Fragment>
        )}
      </View>
    </Provider>
  );
};
//
StreamUI.propTypes = {
  setScreen: PropTypes.func.isRequired,
};
export default StreamUI;
