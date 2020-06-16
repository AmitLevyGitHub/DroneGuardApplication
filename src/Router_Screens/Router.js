import React from "react";
import { S, AS } from "../Assets/consts";
import LoadScreen from "./LoadScreen";
import LogInScreen from "./LogIn";
import BeachesScreen from "./Beaches";
import HomeScreen from "./HomeScreen";
import UploadScreen from "./UploadScreen";
import StreamScreen from "./StreamScreen";
import AsyncStorage from "@react-native-community/async-storage";
global.Buffer = global.Buffer || require("buffer").Buffer;
import { forceUpload } from "../Assets/consts";
//
const Router = () => {
  const [screen, setScreen] = React.useState("load");
  const [userEvents, setUserEvents] = React.useState([]);
  React.useEffect(() => {
    (async () => {
      //
      //check if logged in
      let userToken = null;
      try {
        userToken = await AsyncStorage.getItem(AS.userToken);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(`ERROR getting ${AS.userToken} from async storage!\n${m}`);
      }
      //
      //check if beach chosen
      let beachId = null;
      try {
        beachId = await AsyncStorage.getItem(AS.beachId);
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(`ERROR getting ${AS.beachId} from async storage!\n${m}`);
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
        const m = e.hasOwnProperty("message") ? e.message : e;
        console.log(
          `ERROR getting ${AS.uploadStatus} from async storage!\n${m}`
        );
      }
      //
      //navigate
      if (!userToken) {
        setScreen(S.login);
      } else if (!beachId) {
        setScreen(S.beaches);
      } else {
        if (forceUpload && uploadStatus.length > 0 && uploadStatus[0] !== 1) {
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
      {screen === S.beaches && <BeachesScreen setScreen={setScreen} />}
      {screen === S.home && <HomeScreen setScreen={setScreen} />}
      {screen === S.stream && (
        <StreamScreen
          setScreen={setScreen}
          setUserEvents={setUserEvents}
          userEvents={userEvents}
        />
      )}
      {screen === S.upload && (
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
