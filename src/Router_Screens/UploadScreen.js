import React, { useState, useEffect } from "react";
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
  ScrollView
} from "react-native";
import { Provider, Modal, Button } from "@ant-design/react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { RNFFmpeg } from "react-native-ffmpeg";
import RNFS from "react-native-fs";
import { forceUpload, AS, Screens, StyleConsts } from "../Assets/consts";
import usePrepareUpload from "../Hooks/usePrepareUpload";
import useUploadEvents from "../Hooks/useUploadEvents";
import logger from "../logger";
const caller = "UploadScreen.js";

const UploadScreen = props => {
  const [requirePrepare, setRequirePrepare] = useState(true);
  const [uploadReady, setUploadReady] = useState(false);
  const [
    prepError,
    isPreparing,
    eventsStatus,
    videoStat,
    tokenIDs,
    firstTeleTime
  ] = usePrepareUpload(requirePrepare, props.userEvents);
  const [handleEvents, setHandleEvents] = useState(false);
  const [doneEvents, setDoneEvents] = useState([]);
  const [
    currentEvent,
    workStatus,
    loopFinished,
    failedEvents
  ] = useUploadEvents(
    isPreparing,
    handleEvents,
    eventsStatus,
    videoStat,
    tokenIDs,
    firstTeleTime
  );

  const [showExitModal, setExitModal] = useState(false);
  const shouldShowCurrentEvent = currentEvent.index >= 0 && !loopFinished;

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
      .catch(e => {
        logger(
          "ERROR",
          e.message || e,
          caller,
          `RNFS.unlink(${RNFS.ExternalDirectoryPath})`
        );
      });
    props.setScreen(Screens.home);
  };

  const handleLogoPress = () => {
    if (!forceUpload) {
      if (!loopFinished || failedEvents.length) {
        setExitModal(true);
      } else {
        deleteThenExit();
      }
    }
  };

  const handleStartUploading = () => {
    if (prepError) {
      setRequirePrepare(!requirePrepare);
    } else {
      setUploadReady(true);
      setHandleEvents(true);
    }
  };

  const getEventStatusIcon = status => {
    let source;
    if (status === "working")
      return (source = require("../Assets/Icons/uploaded_in_progress.gif"));
    if (status === "done")
      return (source = require("../Assets/Icons/uploaded_done.png"));
    if (status === "failed")
      return (source = require("../Assets/Icons/uploaded_failed.png"));
    return source;
  };

  return (
    <Provider>
      <ImageBackground
        source={require("../Assets/Icons/home_bg.jpg")}
        style={StyleConsts.backgroundContainerStyle}
      >
        <Modal
          animationType="fade"
          transparent={true}
          closable={true}
          visible={showExitModal}
          title="Are you sure?"
          onClose={() => setExitModal(false)}
        >
          <View style={{ paddingVertical: 20 }}>
            <Text
              style={{ fontSize: 16, alignSelf: "center", marginBottom: 25 }}
            >
              Your data will be permanently lost
            </Text>
            <Button
              style={{ width: 100, borderRadius: 30, alignSelf: "center" }}
              onPress={deleteThenExit}
            >
              Exit
            </Button>
          </View>
        </Modal>
        <View style={styles.header}>
          <TouchableWithoutFeedback
            onPress={handleLogoPress}
            style={{ zIndex: 100 }}
          >
            <Image
              source={require("../Assets/Icons/logo.png")}
              style={StyleConsts.logo}
            />
          </TouchableWithoutFeedback>
          <Image
            source={require("../Assets/StaticLifeGuards/man.jpg")}
            style={StyleConsts.avatar}
          />
        </View>
        {!uploadReady ? (
          <View
            style={{
              display: "flex",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: 20,
              borderRadius: 4
            }}
          >
            <Text style={{ color: "#ffffff", fontSize: 40, paddingBottom: 10 }}>
              {isPreparing
                ? "Preparing Files to upload"
                : prepError
                ? "Error searching files to upload"
                : "Start events uploading"}
            </Text>
            {isPreparing && <ActivityIndicator size="large" color="#0077be" />}
            <Text
              style={{
                color: "#ffffff",
                fontSize: 25,
                alignSelf: "center",
                paddingBottom: 10
              }}
            />
            {!isPreparing && (
              <Button style={styles.modalButton} onPress={handleStartUploading}>
                <Text style={{ color: "#fff" }}>
                  {prepError ? "Try Again" : "Continue"}
                </Text>
              </Button>
            )}
          </View>
        ) : (
          <View style={styles.uploadEventsContainer}>
            <ScrollView
              persistentScrollbar={false}
              style={styles.eventsList}
              contentContainerStyle={styles.eventsListContent}
            >
              <Text style={styles.eventsListHeading}>Events list</Text>
              <View style={styles.eventItemsList}>
                {eventsStatus.map(event => {
                  if (event.status !== "pending") {
                    return (
                      <View style={styles.listItemEvent} key={event.startTime}>
                        <Image
                          source={getEventStatusIcon(event.status)}
                          style={{ width: 40, height: 25 }}
                        />
                        <Text style={styles.eventText}>
                          Event #{event.index + 1}
                        </Text>
                      </View>
                    );
                  }
                })}
              </View>
            </ScrollView>
            <View style={styles.eventContainer}>
              {shouldShowCurrentEvent && (
                <View style={styles.singleEventInProgress}>
                  <Text style={styles.eventHeading}>
                    Handling event #{currentEvent.index + 1}
                  </Text>
                  <View style={styles.contentView}>
                    <Text style={styles.infoHeading}>Duration</Text>
                    <Text style={styles.infoContent}>
                      {(currentEvent.endTime - currentEvent.startTime) / 1000}{" "}
                      seconds
                    </Text>
                  </View>
                  <View style={styles.contentView}>
                    <Text style={styles.infoHeading}>Start Time</Text>
                    <Text style={styles.infoContent}>
                      {currentEvent.startTime}
                    </Text>
                  </View>
                  <View style={styles.contentView}>
                    <Text style={styles.infoHeading}>Status</Text>
                    <Text style={styles.infoContent}>{workStatus}</Text>
                  </View>
                </View>
              )}

              {currentEvent.index >= 0 && loopFinished && (
                <React.Fragment>
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 35,
                      alignSelf: "center",
                      top: "40%",
                      fontWeight: "bold"
                    }}
                  >
                    Uploaded{" "}
                    {eventsStatus.filter(event => event.status !== "failed")
                      .length - failedEvents.length}{" "}
                    events successfully
                  </Text>
                </React.Fragment>
              )}
            </View>
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
    paddingBottom: 5
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    height: 200,
    width: 180,
    alignItems: "center"
  },
  uploadEventsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderRadius: 4,
    width: "95%",
    height: "80%"
  },
  eventsList: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    height: "100%",
    marginRight: 5,
    backgroundColor: "rgba(255, 255, 255, 0.2)"
  },
  eventsListContent: {
    // justifyContent: "center",
    // alignItems: "center"
  },
  eventContainer: {
    display: "flex",
    flex: 3,
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    height: "100%",
    marginLeft: 5
  },
  eventHeading: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    borderBottomColor: "#fff",
    borderBottomWidth: 1
  },
  singleEventInProgress: {
    marginTop: 50,
    display: "flex",
    alignItems: "center"
  },
  infoHeading: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "bold",
    marginBottom: 3
  },
  infoContent: {
    color: "#ffffff",
    fontSize: 20,
    marginBottom: 20
  },
  contentView: { display: "flex", alignItems: "center" },
  listItemEvent: {
    display: "flex",
    flexDirection: "row",
    marginBottom: 25,
    fontSize: 20
  },
  eventItemsList: {
    marginLeft: 60,
    marginTop: 15
  },
  eventsListHeading: {
    color: "#ffffff",
    fontSize: 30,
    marginBottom: 8,
    marginTop: 15,
    marginLeft: 50,
    fontWeight: "bold"
  },
  eventText: {
    color: "#ffffff",
    fontSize: 20,
    marginLeft: 10
  },
  modalButton: {
    backgroundColor: "transparent",
    borderRadius: 30,
    width: 200,
    alignSelf: "center"
  }
});

UploadScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
  setUserEvents: PropTypes.func.isRequired,
  userEvents: PropTypes.array
};

export default UploadScreen;
