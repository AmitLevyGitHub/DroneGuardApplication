import React from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Button,
} from "react-native";
import { Provider, Modal } from "@ant-design/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { RNFFmpeg } from "react-native-ffmpeg";
import RNFS from "react-native-fs";
import { S, forceUpload, AS } from "../Assets/consts";
//
import usePrepareUpload from "../Hooks/usePrepareUpload";
import useUploadEvents from "../Hooks/useUploadEvents";
import logger from "../logger";
const caller = "UploadScreen.js";
//
const UploadScreen = (props) => {
  const [requirePrepare, setRequirePrepare] = React.useState(true);
  const [uploadReady, setUploadReady] = React.useState(false);
  //prepare
  const [
    prepError,
    isPreparing,
    eventsStatus,
    videoStat,
    tokenIDs,
    firstTeleTime,
  ] = usePrepareUpload(requirePrepare, props.userEvents);
  //handle
  const [handleEvents, setHandleEvents] = React.useState(false);
  const [
    currentEvent,
    workStatus,
    loopFinished,
    failedEvents,
  ] = useUploadEvents(
    isPreparing,
    handleEvents,
    eventsStatus,
    videoStat,
    tokenIDs,
    firstTeleTime
  );
  //
  const [showExitModal, setExitModal] = React.useState(false);
  const deleteThenExit = () => {
    logger("DEV", "deleteThenExit", caller);
    RNFFmpeg.cancel();
    AsyncStorage.removeItem(AS.uploadStatus);
    props.setUserEvents([]);
    RNFS.unlink(RNFS.ExternalDirectoryPath)
      .then(() => {
        logger(
          "DEV",
          "files folder deleted",
          caller,
          `RNFS.unlink(${RNFS.ExternalDirectoryPath})`
        );
      })
      .catch((e) => {
        const eStr = e.hasOwnProperty("message") ? e.message : e;
        logger(
          "ERROR",
          eStr,
          caller,
          `RNFS.unlink(${RNFS.ExternalDirectoryPath})`
        );
      });
    props.setScreen(S.home);
  };
  //
  return (
    <Provider>
      <ImageBackground
        source={require("../Assets/Icons/home_bg.png")}
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundSize: "cover",
        }}
      >
        {/** exit modal */}
        <Modal
          animationType="fade"
          transparent={true}
          closable={true}
          visible={showExitModal}
          title="Are you sure?"
          onClose={() => setExitModal(false)}
        >
          <View style={{ paddingVertical: 20 }}>
            <Text>If you exit now data will be permanently lost!</Text>
            <Button title="exit" onPress={deleteThenExit} />
          </View>
        </Modal>
        {/** header */}
        <View style={styles.header}>
          <TouchableWithoutFeedback
            onPress={() => {
              if (forceUpload) {
                return;
              } else {
                if (!loopFinished || failedEvents.length) {
                  setExitModal(true);
                } else {
                  deleteThenExit();
                }
              }
            }}
            style={{ zIndex: 100 }}
          >
            <Image
              source={require("../Assets/Icons/logo.png")}
              style={{ width: 490 / 10, height: 367 / 10 }}
            />
          </TouchableWithoutFeedback>
          {/** temp button */}
          <TouchableOpacity
            onPress={async () => {
              await AsyncStorage.removeItem(AS.uploadStatus);
              console.log("cleared AS.uploadStatus from async storage");
              props.setScreen(S.home);
            }}
          >
            <Text>Clear AS.uploadStatus</Text>
          </TouchableOpacity>
          <Image
            source={require("../Assets/StaticLifeGuards/man.jpg")}
            style={{
              width: 30,
              height: 30,
              borderRadius: 50,
              // // overflow: "hidden",
              // borderWidth: 0.5,
              // borderColor: "white",
              // marginLeft: 8,
              // marginRight: 8
            }}
          />
        </View>
        {!uploadReady ? (
          <View
            style={{
              display: "flex",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: 20,
              borderRadius: 4,
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 40, paddingBottom: 10 }}>
              {isPreparing
                ? "Preparing Files to upload"
                : prepError
                ? "Error Ocurred"
                : "You can start"}
            </Text>
            {isPreparing && <ActivityIndicator size="large" color="#0077be" />}
            <Text
              style={{
                color: "#ffffff",
                fontSize: 25,
                alignSelf: "center",
                paddingBottom: 10,
              }}
            >
              {prepError}
            </Text>
            <Button
              title={prepError ? "Try Again" : "Continue"}
              onPress={() => {
                if (prepError) {
                  setRequirePrepare(!requirePrepare);
                } else {
                  setUploadReady(true);
                }
              }}
            />
          </View>
        ) : (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.2)",
              padding: 10,
              borderRadius: 4,
              width: "95%",
              height: "80%",
              position: "absolute",
              top: 62,
            }}
          >
            {/** Current Event */}
            <View
              style={{
                display: "flex",
                flex: 2,
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
              }}
            >
              {/** start button */}
              {currentEvent.index === -1 && (
                <TouchableOpacity
                  style={{
                    borderColor: "#ffffff",
                    borderWidth: 2,
                    borderRadius: 6,
                    alignSelf: "center",
                  }}
                  onPress={() => {
                    setHandleEvents(true);
                  }}
                >
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 30,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    Start handling all events
                  </Text>
                </TouchableOpacity>
              )}
              {/** current event status */}
              {currentEvent.index >= 0 && !loopFinished && (
                <React.Fragment>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 35,
                      alignSelf: "center",
                    }}
                  >
                    handling event {currentEvent.index + 1}
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 20 }}>
                    duration:{" "}
                    {parseInt(
                      (currentEvent.endTime - currentEvent.startTime) / 1000
                    )}{" "}
                    seconds
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 20 }}>
                    startTime: {currentEvent.startTime}
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 20 }}>
                    {workStatus}
                  </Text>
                </React.Fragment>
              )}
              {/** finish feedback */}
              {currentEvent.index >= 0 && loopFinished && (
                <React.Fragment>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 35,
                      alignSelf: "center",
                    }}
                  >
                    Finished handling all events
                  </Text>
                  {failedEvents.length === 0 && (
                    <Text style={{ color: "#ffffff", fontSize: 20 }}>
                      all events uploaded correctly
                    </Text>
                  )}
                  {failedEvents.length > 0 && (
                    <React.Fragment>
                      <Text style={{ color: "#ffffff", fontSize: 20 }}>
                        {failedEvents.length} events failed, unfortunately these
                        events can not be trimmed and uploaded
                      </Text>
                      {failedEvents.map((failedEvent) => (
                        <Text
                          key={failedEvent.index + 1}
                          style={{ color: "#ffffff", fontSize: 20 }}
                        >
                          event {failedEvent.index + 1}: {failedEvent.status}
                        </Text>
                      ))}
                    </React.Fragment>
                  )}
                </React.Fragment>
              )}
            </View>
            {/** All Events with status */}
            <ScrollView
              persistentScrollbar={true}
              style={{
                display: "flex",
                flex: 1,
                flexDirection: "column",
                paddingHorizontal: 10,
              }}
            >
              <Text style={{ color: "#ffffff", fontSize: 25, marginBottom: 8 }}>
                Total Events: {eventsStatus.length}
              </Text>
              {eventsStatus.map((event) => (
                // <TouchableOpacity key={event.startTime}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                  key={event.startTime}
                >
                  <Text style={{ color: "#ffffff", fontSize: 18 }}>
                    Event {event.index + 1},{" "}
                    {((event.endTime - event.startTime) / 1000).toFixed(0)} sec
                  </Text>
                  <Text style={{ color: "#ffffff", fontSize: 18 }}>
                    {event.status}
                  </Text>
                </View>
                // </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </ImageBackground>
    </Provider>
  );
};

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    backgroundColor: "rgba(66, 66, 66, 0.3)",
    top: 0,
    left: 0,
    zIndex: 100,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    height: 200,
    width: 180,
    // justifyContent: "center",
    alignItems: "center",
  },
});

UploadScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
  setUserEvents: PropTypes.func.isRequired,
  userEvents: PropTypes.array,
};

export default UploadScreen;
