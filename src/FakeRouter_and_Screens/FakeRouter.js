import React from 'react';
import WelcomeScreen from './WelcomeScreen';
import SettingsScreen from './SettingsScreen';
import StreamUI from '../StreamUI/StreamUI';

const FakeRouter = () => {
  const [screen, setScreen] = React.useState('welcome');
  return (
    <React.Fragment>
      {screen === 'welcome' && <WelcomeScreen setScreen={setScreen} />}
      {screen === 'settings' && <SettingsScreen setScreen={setScreen} />}
      {screen === 'mainUI' && <StreamUI setScreen={setScreen} />}
    </React.Fragment>
  );
};

export default FakeRouter;
