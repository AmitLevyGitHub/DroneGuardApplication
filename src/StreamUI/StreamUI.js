//
import React from "react";
import {
  TouchableWithoutFeedback,
  View,
  StyleSheet,
  Button,
  Dimensions,
  Text,
  ActivityIndicator,
} from "react-native";
import PropTypes from "prop-types";
import KeepAwake from "react-native-keep-awake";
//
import useSaveStream from "../Hooks/useSaveStream";
import useProbeStream from "../Hooks/useProbeStream";
import useScaleStream from "../Hooks/useScaleStream";
import VideoStream from "./VideoStream";
//
const styles = StyleSheet.create({
  container: {
    flex: 1,
    zIndex: 1,
    backgroundColor: "#0077be",
  },
  welcomeButton: {
    zIndex: 20,
  },
});
//
const StreamUI = (props) => {
  React.useEffect(() => {
    KeepAwake.activate();
    return function cleanup() {
      KeepAwake.deactivate();
    };
  }, []);
  const [errorOccurred] = useSaveStream();
  const [isProbing, streamWidth, streamHeight] = useProbeStream(errorOccurred);
  const [scaledWidth, scaledHeight, xDiff, yDiff] = useScaleStream(
    streamWidth,
    streamHeight
  );
  //
  return (
    <TouchableWithoutFeedback
      onPress={(e) => {
        console.log(`X = ${e.nativeEvent.locationX}`);
        console.log(`Y = ${e.nativeEvent.locationY}`);
      }}
    >
      <View style={styles.container}>
        {isProbing && (
          <React.Fragment>
            <Text>Probing to get width and height of stream</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </React.Fragment>
        )}
        {!isProbing && (
          <React.Fragment>
            <Button
              title="Welcome screen"
              style={styles.welcomeButton}
              onPress={() => props.setScreen("welcome")}
            />
            <VideoStream
              scaledWidth={scaledWidth}
              scaledHeight={scaledHeight}
              onLayout={(e) => {
                console.log(
                  `in StreamUI.js VideoStream height = ${e.nativeEvent.layout.height}`
                );
              }}
            />
          </React.Fragment>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};
//
StreamUI.propTypes = {
  setScreen: PropTypes.func.isRequired,
};
export default StreamUI;
