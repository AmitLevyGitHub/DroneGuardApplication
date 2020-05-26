import React from "react";
import PropTypes from "prop-types";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  TextInput,
  ImageBackground,
  StyleSheet
} from "react-native";
import { AS, S } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";

const LogInScreen = props => {
  const [username, setUsername] = React.useState(null);
  const [password, setPassword] = React.useState(null);

  const onLogin = async () => {
    console.log("logging in");
    //API call
    //save token to local storage
    //set screen
    try {
      await AsyncStorage.setItem(AS.userToken, "someToken");
      props.setScreen(S.home);
    } catch (e) {
      console.log(
        `ERROR setting ${AS.userToken} in async storage!\n${
          e.hasOwnProperty("message") ? e.message : e
        }`
      );
    }
  };

  return (
    <ImageBackground
      source={require("../Assets/Icons/bg.png")}
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 15
      }}
    >
      <View
        style={{
          width: 200,
          height: "80%",
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          alignItems: "center",
          borderRadius: 4
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
          onChangeText={t => setUsername(t)}
          style={styles.input}
        />
        <TextInput
          secureTextEntry={true}
          value={password}
          placeholder="password"
          placeholderTextColor={"rgba(255,255,255,0.4)"}
          autoCompleteType="password"
          onChangeText={t => setPassword(t)}
          style={styles.input}
        />
        <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
          <Text style={{ color: "#fff", fontSize: 12 }}>Log In</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
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
    paddingBottom: 2
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
    marginTop: 35
  }
});

LogInScreen.propTypes = {
  setScreen: PropTypes.func.isRequired
};

export default LogInScreen;
