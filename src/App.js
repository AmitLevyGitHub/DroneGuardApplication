import React from "react";
import Orientation from "react-native-orientation-locker";
import KeepAwake from "react-native-keep-awake";
import Router from "./Router_Screens/Router";
import logger from "./logger";
import { StatusBar } from "react-native";
global.logger = logger;
global.releasedLiveVest = false;
const App = () => {
  console.disableYellowBox = true;

  React.useLayoutEffect(() => {
    Orientation.lockToLandscapeLeft();
    KeepAwake.activate();
    return function cleanup() {
      Orientation.unlockAllOrientations();
      KeepAwake.deactivate();
    };
  }, []);
  return (
    <React.Fragment>
      <StatusBar hidden={true} />
      <Router />
    </React.Fragment>
  );
};

export default App;
