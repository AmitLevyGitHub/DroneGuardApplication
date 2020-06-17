import React from "react";
import PropTypes from "prop-types";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  TextInput,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { Provider, Modal } from "@ant-design/react-native";
import { AS, S } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
import logger from "../logger";
const caller = "Beaches.js";
//
const BeachesScreen = (props) => {
  const [beaches, setBaches] = React.useState([]);
  const [isFail, setIsFail] = React.useState(false);
  const [fetchMsg, setFetchMsg] = React.useState(null);
  const [storageMsg, setStorageMsg] = React.useState(null);
  //
  React.useEffect(() => {
    (async () => {
      let fail = false;
      let token = null;
      try {
        token = await AsyncStorage.getItem(AS.userToken);
      } catch (e) {
        fail = true;
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", m, caller, `AsyncStorage.getItem(${AS.userToken})`);
        setStorageMsg(m);
      }
      if (fail) {
        setIsFail(fail);
        return;
      }
      //
      try {
        let response = await fetch(
          "https://drone-guard-debriefing-server.herokuapp.com/beaches",
          {
            method: "GET",
            headers: {
              Accept: "application/json, text/plain, */*",
              "Content-Type": "application/json",
              authorization: "Bearer " + token,
            },
          }
        );
        if (response.status === 200) {
          const beachesResponse = await response.json();
          logger(
            "DEV",
            `number of beaches returned = ${beachesResponse.length}`,
            caller
          );
          setBaches(beachesResponse);
        } else {
          const beachesResponseText = await response.text();
          logger("WARNING", response.status, caller, "/beaches");
          fail = true;
          setFetchMsg(
            beachesResponseText.includes("<")
              ? "unknown error"
              : beachesResponseText
          );
        }
      } catch (e) {
        const m = e.hasOwnProperty("message") ? e.message : e;
        logger("WARNING", response.status, caller, "/beaches");
        fail = true;
        setFetchMsg(m);
      }
      if (fail) {
        setIsFail(fail);
        return;
      }
    })();
  }, []);
  //
  return (
    <Provider>
      <ImageBackground
        source={require("../Assets/Icons/bg.png")}
        style={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 15,
        }}
      >
        <Modal
          animationType="fade"
          transparent={true}
          closable={true}
          visible={isFail}
          title="Error getting beaches list, try again"
          onClose={() => {
            setIsFail(false);
            setFetchMsg(null);
            setStorageMsg(null);
          }}
        >
          <View style={{ paddingVertical: 20, justifyContent: "center" }}>
            {fetchMsg && <Text>{fetchMsg}</Text>}
            {storageMsg && <Text>{storageMsg}</Text>}
          </View>
        </Modal>
        <View
          style={{
            width: 200,
            height: "80%",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            alignItems: "center",
            borderRadius: 4,
          }}
        >
          <Image
            source={require("../Assets/Icons/logo.png")}
            style={{ width: 490 / 3, height: 367 / 3 }}
          />
          {beaches.map((beach) => (
            <TouchableOpacity
              onPress={async () => {
                try {
                  logger("DUMMY", `chosen beach = ${beach.name}`, caller);
                  await AsyncStorage.setItem(AS.beachId, beach._id);
                  props.setScreen(S.home);
                } catch (e) {
                  const m = e.hasOwnProperty("message")
                    ? e.message
                    : e.toString();
                  logger(
                    "ERROR",
                    m,
                    caller,
                    `AsyncStorage.setItem(${AS.beachId}, )`
                  );
                  setIsFail(true);
                  setStorageMsg(m);
                }
              }}
            >
              <Text>{beach.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ImageBackground>
    </Provider>
  );
};

const styles = StyleSheet.create({
  input: {
    width: "60%",
    borderBottomWidth: 1,
    borderBottomColor: "white",
    borderStyle: "solid",
    marginTop: 15,
    fontSize: 12,
    paddingLeft: 2,
    paddingBottom: 2,
  },
  loginButton: {
    borderWidth: 1,
    borderColor: "white",
    borderStyle: "solid",
    borderRadius: 20,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 35,
  },
});

BeachesScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default BeachesScreen;
