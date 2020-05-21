import React from "react";
import PropTypes from "prop-types";
import { TouchableOpacity, View, Text, Image, TextInput } from "react-native";
import { AS, S } from "../Assets/consts";
import AsyncStorage from "@react-native-community/async-storage";

const LogInScreen = (props) => {
  const [username, setUsername] = React.useState(null);
  const [password, setPassword] = React.useState(null);
  return (
    <View
      style={{
        display: "flex",
        flexDirection: "row",
        flex: 1,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#0077be",
        padding: 15,
      }}
    >
      <Image
        source={require("../Assets/Icons/logo.png")}
        style={{ width: 490 / 2, height: 367 / 2 }}
      />
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
        <Text style={{ color: "#ffffff", fontSize: 40 }}>Please Log In</Text>
        <View style={{ width: "50%" }}>
          <TextInput
            value={username}
            placeholder="email"
            autoCompleteType="email"
            onChangeText={(t) => setUsername(t)}
            style={{
              // width: "50%",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              marginBottom: 20,
            }}
          />
          <TextInput
            secureTextEntry={true}
            value={password}
            placeholder="password"
            autoCompleteType="password"
            onChangeText={(t) => setPassword(t)}
            style={{
              // width: "50%",
              borderRadius: 10,
              backgroundColor: "#ffffff",
            }}
          />
        </View>
        <TouchableOpacity
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#ffffff",
            borderRadius: 10,
            paddingVertical: 4,
            paddingHorizontal: 10,
          }}
          onPress={async () => {
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
          }}
        >
          <Text style={{ color: "#000000", fontSize: 20 }}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
LogInScreen.propTypes = {
  setScreen: PropTypes.func.isRequired,
};

export default LogInScreen;
