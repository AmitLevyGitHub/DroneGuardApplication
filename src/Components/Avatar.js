import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-community/async-storage";
import { Image } from "react-native";
import { AS, StyleConsts } from "src/Assets/consts";

const Avatar = () => {
  const [userImage, setUserImage] = useState(
    require("../Assets/Icons/avatar.png")
  );
  useEffect(() => {
    (async () => {
      const userImage = await AsyncStorage.setItem(AS.lifeGuardImage);
      if (userImage) {
        setUserImage(userImage);
      }
    })();
  }, []);
  return <Image source={userImage} style={StyleConsts.avatar} />;
};

export default Avatar;
