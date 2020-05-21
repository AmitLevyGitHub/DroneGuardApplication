import React from "react";
import Orientation from "react-native-orientation-locker";
import KeepAwake from "react-native-keep-awake";
import Router from "./Router_Screens/Router";

const App = () => {
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
      <Router />
    </React.Fragment>
  );
};

export default App;
