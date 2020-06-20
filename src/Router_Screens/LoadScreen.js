import React, { useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

const LoadScreen = () => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "black"
      }}
    >
      <ActivityIndicator
        size="large"
        color="#ffffff"
        style={{ transform: [{ scale: 3 }] }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  imageStyle: {
    width: 250,
    height: 150
  }
});

export default LoadScreen;
