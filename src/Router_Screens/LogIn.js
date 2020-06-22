import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  View,
  Text,
  Image,
  TextInput,
  ImageBackground,
  StyleSheet
} from "react-native";
import BeachesModal from "../Components/BeachesModal";
import { Provider, Button } from "@ant-design/react-native";
import { AS, Screens } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
import logger from "../logger";
const caller = "LogIn.js";

const LogInScreen = props => {
  const [username, setUsername] = useState(null);
  const [password, setPassword] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showBeachesModal, setShowBeachesModal] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      const userToken = await AsyncStorage.getItem(AS.userToken);
      if (userToken) setShowBeachesModal(true);
    })();
  }, []);

  const handleError = (level, errorMessage, subCaller) => {
    logger(level, errorMessage, caller, subCaller);
    setLoading(false);
    setError(true);
  };

  const onLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://drone-guard-debriefing-server.herokuapp.com/login", {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: username,
          password: password
        })
      });
      const { status, message } = response;
      const loginResponse = await response.json();
      if (status === 200) {
        logger("DUMMY", `token = ${loginResponse.token}`, caller, "/login");
        try {
          await AsyncStorage.setItem(AS.userToken, loginResponse.token);
          await AsyncStorage.setItem(AS.lifeGuardId, loginResponse.user._id);
          console.log("loginResponse.userData:", loginResponse.userData);
          if (
            loginResponse.userData &&
            loginResponse.userData[0] &&
            loginResponse.userData[0].image
          ) {
            await AsyncStorage.setItem(
              AS.lifeGuardImage,
              loginResponse.userData[0].image
            );
          }
          setShowBeachesModal(true);
        } catch (e) {
          handleError("DEV", e.message || e, "/AsyncStorage.setItem()");
        }
      } else {
        handleError("DEV", message, "/login");
      }
    } catch (e) {
      handleError("DEV", e.message || e, "/login");
    }
  };

  const onChooseBeach = async beach => {
    try {
      logger("DUMMY", `chosen beach = ${beach.name}`, caller);
      await AsyncStorage.setItem(AS.beachId, beach._id);
      props.setScreen(Screens.home);
    } catch (e) {
      handleError("WARNING", e.message || e, "/AsyncStorage.setItem()");
    }
  };

  return (
    <Provider>
      <ImageBackground
        source={require("../Assets/Icons/bg.png")}
        style={styles.background}
      >
        <View style={styles.card}>
          <Image
            source={require("../Assets/Icons/logo.png")}
            style={styles.logo}
          />
          <View style={styles.inputs}>
            <TextInput
              value={username}
              placeholder="Email"
              placeholderTextColor={"rgba(255,255,255,0.4)"}
              autoCompleteType="email"
              onChangeText={t => setUsername(t)}
              style={styles.input}
              keyboardType="email-address"
            />
            <TextInput
              secureTextEntry={true}
              value={password}
              placeholder="Password"
              placeholderTextColor={"rgba(255,255,255,0.4)"}
              autoCompleteType="password"
              onChangeText={t => setPassword(t)}
              style={styles.input}
            />
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.error}>
                  Error while trying to login, Try again
                </Text>
              </View>
            )}
          </View>
          <Button
            loading={loading}
            style={styles.loginButton}
            onPress={onLogin}
          >
            <Text style={{ color: "white" }}>Login</Text>
          </Button>
        </View>
      </ImageBackground>
      {showBeachesModal && <BeachesModal onChooseBeach={onChooseBeach} />}
    </Provider>
  );
};

const styles = StyleSheet.create({
  input: {
    width: "100%",
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
    borderRadius: 50,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5,
    marginTop: 70,
    backgroundColor: "transparent",
    width: 100,
    height: 40
  },
  background: {
    display: "flex",
    flexDirection: "row",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 15
  },
  card: {
    width: "30%",
    height: "65%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
    borderRadius: 4
  },
  logo: {
    width: 490 / 3,
    height: 367 / 3,
    marginTop: "10%"
  },
  inputs: {
    width: "60%",
    marginTop: "10%"
  },
  errorContainer: {
    position: "absolute",
    textAlign: "center",
    top: 130
  },
  error: {
    color: "red"
  }
});

LogInScreen.propTypes = {
  setScreen: PropTypes.func.isRequired
};

export default LogInScreen;
