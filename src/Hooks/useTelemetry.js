import React from "react";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-community/async-storage";
import { FN, AS, navConsts, shouldSave } from "../Assets/consts";
export default function useTelemetry(socket) {
  //tele
  const [droneTele, setDroneTele] = React.useState({
    batStatus: 0,
    wifiSignal: 0,
  });
  const [gpsTele, setGpsTele] = React.useState({
    latitude: -1.0,
    longitude: -1.0,
    altitude: -1.0,
    bearing: -1.0,
  });
  //emergency events detection
  const eventsCounter = React.useRef(1);
  const startTime = React.useRef(-1);
  //
  //
  React.useEffect(() => {
    const save = shouldSave.tele;
    if (!socket) return;
    socket.on("message", (msg) => {
      const M = JSON.parse(msg.toString());
      if (M.type !== "allTelemetry") return;
      // console.log(`data received with altitude = ${M.altitude}`);
      const receivedTele = { ...M };
      // console.log(`allTelemetry: ${JSON.stringify(receivedTele, null, 2)}`);
      // console.log(`altitude = ${receivedTele.altitude}`);
      function scaleBat(
        num,
        in_min = 0,
        in_max = 100,
        out_min = 0,
        out_max = 4
      ) {
        let scaled =
          ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        scaled = Math.floor(scaled);
        if (scaled === 0) {
          return "battery-empty";
        } else if (scaled === 1) {
          return "battery-quarter";
        } else if (scaled === 2) {
          return "battery-half";
        } else if (scaled === 3) {
          return "battery-three-quarters";
        } else if (scaled === 4) {
          return "battery-full";
        }
      }
      function scaleWifi(
        num,
        in_min = 0,
        in_max = 100,
        out_min = 0,
        out_max = 3
      ) {
        let scaled =
          ((num - in_min) * (out_max - out_min)) / (in_max - in_min) + out_min;
        scaled = Math.floor(scaled);
        return scaled;
      }
      setDroneTele({
        time: receivedTele.time,
        batStatus: receivedTele.batStatus,
        batIcon: scaleBat(receivedTele.batStatus),
        // wifiSignal: receivedTele.wifiSignal,
        wifiIcon: scaleWifi(receivedTele.wifiSignal),
      });
      setGpsTele({
        time: receivedTele.time,
        latitude: receivedTele.latitude,
        longitude: receivedTele.longitude,
        altitude: receivedTele.altitude,
        bearing: receivedTele.bearing,
      });
      /**
       * save telemetry to file
       */
      (async () => {
        if (!save) return;
        if (!receivedTele.hasOwnProperty("time")) return;
        const path = RNFS.ExternalDirectoryPath + "/tele.txt";
        const stringifiedTele = JSON.stringify(receivedTele);
        RNFS.appendFile(path, stringifiedTele + ",")
          .then(() => {
            // console.log("FILE WRITTEN!");
          })
          .catch((err) => {
            console.log(err.message);
          });
      })();
      /**
       * check isEmergency and save to asyncStorage
       */
      (async () => {
        if (!save) return;
        if (!receivedTele.hasOwnProperty("time")) return;
        if (
          startTime.current === -1 &&
          receivedTele.altitude <= navConsts.emergencyHeight
        ) {
          startTime.current = receivedTele.time;
          console.log(`emergency event starting now: ${receivedTele.time}`);
        }
        if (
          startTime.current > -1 &&
          receivedTele.altitude > navConsts.emergencyHeight
        ) {
          console.log(`emergency event ends now: ${receivedTele.time}`);
          const key = `${AS.emergencyEvent}_${eventsCounter.current}`;
          try {
            const jsonValue = JSON.stringify({
              startTime: startTime.current,
              endTime: receivedTele.time,
            });
            await AsyncStorage.setItem(key, jsonValue);
            console.log(`${key} saved to asyncStorage`);
          } catch (e) {
            console.log(
              `ERROR saving ${key} to async storage! ${
                e.hasOwnProperty("message") ? e.message : e
              }`
            );
          }
          startTime.current = -1;
          eventsCounter.current++;
        }
      })();
    });
  }, [socket]);
  return [droneTele, gpsTele];
}
