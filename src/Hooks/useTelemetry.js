import React from "react";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-community/async-storage";
import {
  teleFile,
  appErrorsFile,
  emergencyEventKey,
  emergencyHeight,
} from "../Assets/consts";
export default function useTelemetry(socket) {
  //tele
  const [droneTele, setDroneTele] = React.useState({
    batStatus: -1,
    wifiSignal: -1,
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
    if (!socket) return;
    socket.on("allTelemetry", (receivedTele) => {
      // console.log(`allTelemetry: ${JSON.stringify(receivedTele, null, 2)}`);
      // console.log(`altitude = ${receivedTele.altitude}`);
      setDroneTele({
        time: receivedTele.time,
        batStatus: receivedTele.batStatus,
        wifiSignal: receivedTele.wifiSignal,
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
        if (!receivedTele.hasOwnProperty("time")) return;
        if (
          startTime.current === -1 &&
          receivedTele.altitude <= emergencyHeight
        ) {
          startTime.current = receivedTele.time;
          console.log(`emergency event starting now: ${receivedTele.time}`);
        }
        if (startTime.current > -1 && receivedTele.altitude > emergencyHeight) {
          console.log(`emergency event ends now: ${receivedTele.time}`);
          const key = `${emergencyEventKey}_${eventsCounter.current}`;
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
