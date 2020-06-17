import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet,
  ImageBackground,
} from "react-native";
import { S, AS, isUploadDisabled, forceUpload } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
import logger from "../logger";
const caller = "HomeScreen.js";
//
const HomeScreen = (props) => {
  return (
    <ImageBackground
      source={require("../Assets/Icons/home_bg.png")}
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundSize: "cover",
      }}
    >
      <View style={styles.header}>
        {/** Home Screen Button */}
        <TouchableWithoutFeedback
          onPress={() => {
            if (forceUpload) {
              props.setScreen(S.upload);
            } else {
              props.setScreen(S.home);
            }
          }}
          style={{ zIndex: 100 }}
        >
          <Image
            source={require("../Assets/Icons/logo.png")}
            style={{ width: 490 / 10, height: 367 / 10 }}
          />
        </TouchableWithoutFeedback>
        {/** logout button */}
        <TouchableWithoutFeedback
          onPress={() => {
            AsyncStorage.clear();
            logger("DEV", "user logged out", caller);
            props.setScreen(S.login);
          }}
          style={{ zIndex: 100 }}
        >
          <Text>logout</Text>
        </TouchableWithoutFeedback>
        {/** life guard image avatar */}
        <Image
          source={require("../Assets/StaticLifeGuards/man.jpg")}
          style={{
            width: 30,
            height: 30,
            borderRadius: 50,
            // // overflow: "hidden",
            // borderWidth: 0.5,
            // borderColor: "white",
            // marginLeft: 8,
            // marginRight: 8
          }}
        />
      </View>
      <View style={styles.cardsContainer}>
        <TouchableOpacity style={styles.card}>
          <Image
            source={require("../Assets/Icons/streaming.png")}
            style={{ width: 100, height: 100, marginTop: 15 }}
          />
          <TouchableOpacity
            style={styles.textWrapper}
            onPress={() => {
              props.setScreen(S.stream);
            }}
          >
            <Text style={styles.text}>STREAM</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <View disabled={isUploadDisabled} style={styles.card}>
          <Image
            source={require("../Assets/Icons/upload.png")}
            style={{ width: 100, height: 100, marginTop: 15 }}
          />

          <TouchableOpacity
            style={styles.textWrapper}
            onPress={() => props.setScreen(S.upload)}
          >
            <Text style={styles.text}>UPLOAD</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/*<Button*/}
      {/*  title="log out"*/}
      {/*  onPress={async () => {*/}
      {/*    try {*/}
      {/*      await AsyncStorage.removeItem(AS.userToken);*/}
      {/*      props.setScreen(S.login);*/}
      {/*    } catch (e) {*/}
      {/*      console.log(*/}
      {/*        `ERROR removing ${AS.userToken} from async storage!\n${*/}
      {/*          e.hasOwnProperty("message") ? e.message : e*/}
      {/*        }`*/}
      {/*      );*/}
      {/*    }*/}
      {/*  }}*/}
      {/*/>*/}
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
    paddingBottom: 5,
  },
  cardsContainer: {
    flexDirection: "row",
    width: "80%",
    justifyContent: "space-around",
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    height: 200,
    width: 180,
    // justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 15,
    textAlign: "center",
    color: "white",
  },
  textWrapper: {
    borderRadius: 20,
    borderStyle: "solid",
    borderColor: "white",
    borderWidth: 1,
    padding: 5,
    width: 100,
    marginTop: 30,
  },
});

HomeScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default HomeScreen;
