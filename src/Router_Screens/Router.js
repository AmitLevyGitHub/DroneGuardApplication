import React, { useState, useEffect } from "react";
import { Screens, AS } from "../Assets/consts";
import LoadScreen from "./LoadScreen";
import LogInScreen from "./LogIn";
import HomeScreen from "./HomeScreen";
import UploadScreen from "./UploadScreen";
import StreamScreen from "./StreamScreen";
import AsyncStorage from "@react-native-community/async-storage";
import { forceUpload } from "../Assets/consts";
import logger from "../logger";
const caller = "Router.js";

const Router = () => {
  const [screen, setScreen] = useState("load");
  const [userEvents, setUserEvents] = useState([]);

  useEffect(() => {
    (async () => {
      let userToken = null;
      let beachId = null;
      let uploadStatus = [];
      try {
        userToken = await AsyncStorage.getItem(AS.userToken);
        beachId = await AsyncStorage.getItem(AS.beachId);
        const uploadStatusString = await AsyncStorage.getItem(AS.uploadStatus);
        if (uploadStatusString) {
          uploadStatus = JSON.parse(uploadStatusString);
          if (!Array.isArray(uploadStatus)) {
            uploadStatus = [];
          }
        }
      } catch (e) {
        logger("ERROR", e.message || e, caller, `AsyncStorage.getItem()`);
      }

      if (!userToken || (userToken && !beachId)) {
        setScreen(Screens.login);
      } else {
        if (forceUpload && uploadStatus.length && uploadStatus[0] !== 1) {
          setScreen(Screens.upload);
        } else {
          setScreen(Screens.home);
        }
      }
    })();
  }, []);

  return (
    <React.Fragment>
      {screen === Screens.load && <LoadScreen />}
      {screen === Screens.login && <LogInScreen setScreen={setScreen} />}
      {screen === Screens.home && <HomeScreen setScreen={setScreen} />}
      {screen === Screens.stream && (
        <StreamScreen
          setScreen={setScreen}
          setUserEvents={setUserEvents}
          userEvents={userEvents}
        />
      )}
      {screen === Screens.upload && (
        <UploadScreen
          setScreen={setScreen}
          setUserEvents={setUserEvents}
          userEvents={userEvents}
        />
      )}
    </React.Fragment>
  );
};

export default Router;
