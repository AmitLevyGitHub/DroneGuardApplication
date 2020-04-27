import React from 'react';
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
    <React.Fragment>
      <FakeRouter />
    </React.Fragment>
  );
};

export default App;
