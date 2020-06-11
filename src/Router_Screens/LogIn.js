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

const LogInScreen = (props) => {
  const [username, setUsername] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  const [isFail, setIsFail] = React.useState(false);
  const [fetchMsg, setFetchMsg] = React.useState(null);
  const [storageMsg, setStorageMsg] = React.useState(null);
  const [token, setToken] = React.useState(null);
  //
  const onLogin = async () => {
    console.log("onLogin");
    //API call
    let fail = false;
    let tokenTmp = null;
    let idTmp = null;
    try {
      let response = await fetch(
        "https://drone-guard-debriefing-server.herokuapp.com/login",
        {
          method: "POST",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: username,
            password: password,
          }),
        }
      );
      if (response.status === 200) {
        const loginResponse = await response.json();
        console.log(`token = ${loginResponse.token}`);
        tokenTmp = loginResponse.token;
        idTmp = loginResponse.user._id;
        setToken(tokenTmp);
        setFetchMsg(loginResponse.msg);
      } else {
        const loginResponseText = await response.text();
        console.log(`login failed with status = ${response.status}`);
        fail = true;
        setFetchMsg(
          loginResponseText.includes("<") ? "unknown error" : loginResponseText
        );
      }
    } catch (e) {
      console.log(e);
      const m = e.hasOwnProperty("message") ? e.message : e;
      console.log(`login failed with error = ${m}`);
      fail = true;
      setFetchMsg(m);
    }
    if (fail) {
      setIsFail(fail);
      return;
    }
    //save token & lifeGuardId to local storage
    try {
      await AsyncStorage.setItem(AS.userToken, tokenTmp);
      await AsyncStorage.setItem(AS.lifeGuardId, idTmp);
    } catch (e) {
      const m = e.hasOwnProperty("message") ? e.message : e.toString();
      console.log(`ERROR setting in async storage!\n${m}`);
      fail = true;
      setStorageMsg(m);
    }
    //set screen / show modal
    if (fail) {
      setIsFail(fail);
    } else {
      props.setScreen(S.beaches);
    }
  };
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
          title="Login Failed, try again"
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
          <TextInput
            value={username}
            placeholder="email"
            placeholderTextColor={"rgba(255,255,255,0.4)"}
            autoCompleteType="email"
            onChangeText={(t) => setUsername(t)}
            style={styles.input}
            keyboardType="email-address"
          />
          <TextInput
            secureTextEntry={true}
            value={password}
            placeholder="password"
            placeholderTextColor={"rgba(255,255,255,0.4)"}
            autoCompleteType="password"
            onChangeText={(t) => setPassword(t)}
            style={styles.input}
          />
          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={{ color: "#fff", fontSize: 12 }}>Log In</Text>
          </TouchableOpacity>
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

LogInScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default LogInScreen;
