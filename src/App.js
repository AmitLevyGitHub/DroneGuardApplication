import React from 'react';
import {View} from 'react-native';
import Orientation from 'react-native-orientation-locker';
import FakeRouter from './FakeRouter_and_Screens/FakeRouter';

const App = () => {
  React.useEffect(() => {
    Orientation.lockToLandscapeLeft();
    return function cleanup() {
      Orientation.unlockAllOrientations();
    };
  }, []);
  return (
    <View>
      <FakeRouter />
    </View>
  );
};

export default App;
