import React from "react";
import { View, Text, ActivityIndicator } from "react-native";

const LoadScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#0077be",
      }}
    >
      <Text style={{ color: "#ffffff", fontSize: 60 }}>Please Wait</Text>
      <ActivityIndicator
        size="large"
        color="#ffffff"
        style={{ transform: [{ scale: 3 }] }}
      />
    </View>
  );
};
export default LoadScreen;
