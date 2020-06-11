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
//
const UploadScreen = (props) => {
  const [isPreparing, eventsStatus, videoStat, tokenIDs] = usePrepareUpload();
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
    tokenIDs
  );
  const [showExitModal, setExitModal] = React.useState(false);
  //
  return (
    <Provider>
      <ImageBackground
        source={require("../Assets/Icons/home_bg.png")}
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundSize: "cover",
        }}
      >
        {/** preparing upload modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={isPreparing}
          title="Loading Events List"
        >
          <View style={{ paddingVertical: 20 }}>
            <ActivityIndicator size="large" color="#0077be" />
          </View>
        </Modal>
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
            <Button
              title="exit"
              onPress={() => {
                RNFFmpeg.cancel();
                AsyncStorage.removeItem(AS.uploadStatus);
                RNFS.unlink(RNFS.ExternalDirectoryPath)
                  .then(() => {
                    console.log("files folder deleted");
                  })
                  .catch((err) => {
                    console.log(err.message);
                  });

                props.setScreen(S.home);
              }}
            />
          </View>
        </Modal>
        {/** header */}
        <View style={styles.header}>
          <TouchableWithoutFeedback
            onPress={() => {
              if (forceUpload) {
                return;
              } else {
                if (!loopFinished) {
                  setExitModal(true);
                } else {
                  props.setScreen(S.home);
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
        {/** main wrapper */}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          {/** Current Event */}
          <View
            style={{
              display: "flex",
              flex: 3,
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: 5,
              borderRadius: 4,
              height: "100%",
              width: "100%",
            }}
          >
            {currentEvent.index === -1 && (
              <TouchableOpacity
                style={{ backgroundColor: "white" }}
                onPress={() => {
                  console.log("setting handleEvent to true");
                  setHandleEvents(true);
                }}
              >
                <Text>Start handling all events</Text>
              </TouchableOpacity>
            )}
            {currentEvent.index >= 0 && !loopFinished && (
              <React.Fragment>
                <Text>handling event {currentEvent.index}</Text>
                <Text>startTime: {currentEvent.startTime}</Text>
                <Text>{workStatus}</Text>
              </React.Fragment>
            )}
            {currentEvent.index >= 0 && loopFinished && (
              <React.Fragment>
                <Text>Finished handling all events</Text>
                {failedEvents.length === 0 && (
                  <Text>all events uploaded correctly</Text>
                )}
                {failedEvents.length > 0 && (
                  <React.Fragment>
                    <Text>
                      {failedEvents.length} events failed, unfortunately these
                      events can not be trimmed and uploaded
                    </Text>
                    {failedEvents.map((failedEvent) => (
                      <Text>
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
            style={{
              display: "flex",
              flex: 2,
              flexDirection: "column",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              padding: 5,
              borderRadius: 4,
              height: "100%",
              width: "100%",
            }}
          >
            <Text>Total events to handle: {eventsStatus.length}</Text>
            {eventsStatus.map((event) => (
              <TouchableOpacity>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>Event {event.index + 1}</Text>
                  {event.failed ? (
                    <Text>failed</Text>
                  ) : (
                    <Text>
                      {event.index === currentEvent.index
                        ? "working"
                        : "pending"}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
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
};

export default UploadScreen;
