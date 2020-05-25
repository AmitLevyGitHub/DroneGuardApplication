import React from "react";
import { S, AS } from "../Assets/consts";
import LoadScreen from "./LoadScreen";
import LogInScreen from "./LogIn";
import HomeScreen from "./HomeScreen";
import UploadScreen from "./UploadScreen";
import StreamScreen from "./StreamScreen";
import AsyncStorage from "@react-native-community/async-storage";
global.Buffer = global.Buffer || require("buffer").Buffer;
//
const Router = () => {
  const [screen, setScreen] = React.useState("load");
  React.useEffect(() => {
    (async () => {
      //
      //check if logged in
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem(AS.userToken);
      } catch (e) {
        console.log(
          `ERROR reading ${AS.userToken} from async storage!\n${
            e.hasOwnProperty("message") ? e.message : e
          }`
        );
      }
      //
      //check upload status
      let uploadStatus = [];
      try {
        uploadStatusString = await AsyncStorage.getItem(AS.uploadStatus);
        if (uploadStatusString) {
          uploadStatus = JSON.parse(uploadStatusString);
          if (!Array.isArray(uploadStatus)) {
            uploadStatus = [];
          }
        }
      } catch (e) {
        console.log(
          `ERROR reading ${AS.uploadStatus} from async storage!\n${
            e.hasOwnProperty("message") ? e.message : e
          }`
        );
      }
      //
      //navigate
      if (!userToken) {
        setScreen(S.login);
      } else {
        if (uploadStatus.length > 0) {
          setScreen(S.upload);
        } else {
          setScreen(S.home);
        }
      }
    })();
  }, []);
  return (
    <React.Fragment>
      {screen === S.load && <LoadScreen />}
      {screen === S.login && <LogInScreen setScreen={setScreen} />}
      {screen === S.home && <HomeScreen setScreen={setScreen} />}
      {screen === S.stream && <StreamScreen setScreen={setScreen} />}
      {screen === S.upload && <UploadScreen setScreen={setScreen} />}
    </React.Fragment>
  );
};

export default Router;
