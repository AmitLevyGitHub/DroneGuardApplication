import React from "react";
import PropTypes from "prop-types";
import { View, Text, ActivityIndicator } from "react-native";
import CropUploadStuff from "./CropUploadStuff";
import { Provider, Modal } from "@ant-design/react-native";
import { S } from "../Assets/consts";
//
import usePrepareUpload from "../Hooks/usePrepareUpload";
import useUploadEvents from "../Hooks/useUploadEvents";
//
const UploadScreen = (props) => {
  const [isPreparing, eventsStatus, videoStat] = usePrepareUpload();
  const [currentEvent] = useUploadEvents(isPreparing, eventsStatus, videoStat);
  //
  return (
    <Provider>
      <View
        style={{
          flex: 1,
          zIndex: 1,
          backgroundColor: "#d0efff",
          justifyContent: "center",
          alignItems: "center",
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
        {/** header */}
        <Text>
          Uploading event {currentEvent.index + 1} of {eventsStatus.length}
        </Text>
        <CropUploadStuff />
      </View>
    </Provider>
  );
};
UploadScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default UploadScreen;
