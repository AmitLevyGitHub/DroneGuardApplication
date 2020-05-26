import React from "react";
import PropTypes from "prop-types";
import {
  Button,
  Text,
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  StyleSheet
} from "react-native";
import { S, AS, isUploadDisabled, forceUpload } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
//
const HomeScreen = props => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#d0efff"
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

        <Image
          source={require("../Assets/StaticLifeGuards/man.jpg")}
          style={{
            width: 30,
            height: 30,
            borderRadius: 50
            // // overflow: "hidden",
            // borderWidth: 0.5,
            // borderColor: "white",
            // marginLeft: 8,
            // marginRight: 8
          }}
        />
      </View>
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          onPress={() => {
            props.setScreen(S.stream);
          }}
          style={styles.card}
        >
          <Text style={styles.text}>Stream</Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={isUploadDisabled}
          onPress={async () => props.setScreen(S.upload)}
          style={styles.card}
        >
          <Text style={styles.text}>Upload Events</Text>
        </TouchableOpacity>
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
    </View>
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
    backgroundColor: "rgba(255, 255, 255, 0.5)",
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
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 4,
    height: 200,
    width: 180,
    justifyContent: "center"
  },
  text: { fontSize: 25, textAlign: "center" }
});

HomeScreen.propTypes = {
  setScreen: PropTypes.func.isRequired
};

export default HomeScreen;
