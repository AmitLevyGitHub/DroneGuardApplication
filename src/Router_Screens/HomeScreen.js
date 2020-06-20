import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  ImageBackground,
  PermissionsAndroid
} from "react-native";
import {
  Screens,
  isUploadDisabled,
  forceUpload,
  StyleConsts,
  AS
} from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
import logger from "../logger";
const caller = "HomeScreen.js";

const HomeScreen = props => {
  useEffect(() => {
    (async () => {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        ]);
      } catch (e) {
        logger("WARNING", e.message || e, caller);
      }
    })();
  }, []);

  const onLogoPress = () => {
    if (forceUpload) {
      props.setScreen(Screens.upload);
    } else {
      props.setScreen(Screens.home);
    }
  };
  const onLogout = () => {
    AsyncStorage.clear();
    logger("DEV", "user logged out", caller);
    props.setScreen(Screens.login);
  };
  return (
    <ImageBackground
      source={require("../Assets/Icons/home_bg.jpg")}
      style={StyleConsts.backgroundContainerStyle}
    >
      <View style={styles.header}>
        <TouchableWithoutFeedback
          onPress={onLogoPress}
          style={styles.zIndexStyle}
        >
          <Image
            source={require("../Assets/Icons/logo.png")}
            style={StyleConsts.logo}
          />
        </TouchableWithoutFeedback>
        <View style={styles.avatarContainer}>
          <TouchableWithoutFeedback
            onPress={onLogout}
            style={styles.zIndexStyle}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableWithoutFeedback>
          <Image
            source={require("../Assets/StaticLifeGuards/man.jpg")}
            style={StyleConsts.avatar}
          />
        </View>
      </View>
      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card}>
          <Image
            source={require("../Assets/Icons/streaming.png")}
            style={styles.iconsStyle}
          />
          <TouchableOpacity
            style={styles.textWrapper}
            onPress={() => {
              props.setScreen(Screens.stream);
            }}
          >
            <Text style={styles.text}>STREAM</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <View disabled={isUploadDisabled} style={styles.card}>
          <Image
            source={require("../Assets/Icons/upload.png")}
            style={styles.iconsStyle}
          />
          <TouchableOpacity
            style={styles.textWrapper}
            onPress={() => props.setScreen(Screens.upload)}
          >
            <Text style={styles.text}>UPLOAD</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 5,
    paddingBottom: 5
  },
  cardsContainer: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "space-around"
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    height: 400,
    width: 380,
    // justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 30,
    textAlign: "center",
    color: "white"
  },
  textWrapper: {
    borderRadius: 25,
    borderStyle: "solid",
    borderColor: "white",
    borderWidth: 1,
    padding: 5,
    width: 200,
    marginTop: 50
  },
  zIndexStyle: {
    zIndex: 100
  },
  iconsStyle: {
    width: 180,
    height: 180,
    marginTop: 50
  },
  avatarContainer: {
    display: "flex",
    flexDirection: "row",
    width: 130,
    justifyContent: "space-between",
    alignItems: "center"
  },
  logoutText: {
    color: "#fff",
    fontSize: 18
  }
});

HomeScreen.propTypes = {
  setScreen: PropTypes.func.isRequired
};

export default HomeScreen;
