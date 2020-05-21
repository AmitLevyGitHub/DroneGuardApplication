import React from "react";
import PropTypes from "prop-types";
import { Button, Text, View, TouchableOpacity } from "react-native";
import { S, AS } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";
//
const HomeScreen = (props) => {
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#d0efff",
        padding: 15,
      }}
    >
      <TouchableOpacity
        onPress={() => {
          props.setScreen(S.stream);
        }}
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "40%",
          backgroundColor: "#ffffff",
          borderRadius: 10,
          paddingVertical: 4,
          paddingHorizontal: 10,
        }}
      >
        <Text style={{ fontSize: 40 }}>Stream UI</Text>
      </TouchableOpacity>
      <View
        style={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          justifyContent: "space-around",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Text style={{ fontSize: 30 }}>Welcome to DroneGuard app</Text>
        <Button
          title="upload events"
          onPress={async () => props.setScreen(S.upload)}
        />
        <Button
          title="log out"
          onPress={async () => {
            try {
              await AsyncStorage.removeItem(AS.userToken);
              props.setScreen(S.login);
            } catch (e) {
              console.log(
                `ERROR removing ${AS.userToken} from async storage!\n${
                  e.hasOwnProperty("message") ? e.message : e
                }`
              );
            }
          }}
        />
      </View>
    </View>
  );
};
HomeScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default HomeScreen;
