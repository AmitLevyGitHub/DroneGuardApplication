import React from "react";
import RNFS from "react-native-fs";
import { FN, shouldSave } from "../Assets/consts";
export default function useTelemetry(socket, hasStarted) {
  //tele
  const [droneTele, setDroneTele] = React.useState({
    batStatus: 100,
    wifiSignal: 90,
  });
  const [gpsTele, setGpsTele] = React.useState({
    latitude: -1.0,
    longitude: -1.0,
    altitude: 93,
    bearing: -1.0,
  });
  //emergency events detection
  const eventsCounter = React.useRef(1);
  const startTime = React.useRef(-1);
  //
  //
  React.useEffect(() => {
    const save = shouldSave.tele;
    if (!hasStarted && !socket) return;
    // if (!socket.connected) return;
    socket.on("allTelemetry", (receivedTele) => {
      console.log(
        "on allTelemetry, height " +
          receivedTele.height +
          " startTime.current = " +
          startTime.current
      );
      // console.log(`data received with altitude = ${M.altitude}`);
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
      const now = Date.now();
      setDroneTele({
        time: now,
        batStatus: receivedTele.batStatus,
        batIcon: scaleBat(receivedTele.batStatus),
        // wifiSignal: receivedTele.wifiSignal,
        wifiIcon: scaleWifi(
          receivedTele.wifiSignal ? receivedTele.wifiSignal : 10
        ),
      });
      setGpsTele({
        time: now,
        latitude: receivedTele.latitude,
        longitude: receivedTele.longitude,
        altitude: receivedTele.height,
        bearing: receivedTele.yaw,
      });
      /**
       * save telemetry to file
       */
      let telemetryToSave = { ...receivedTele, time: now };
      (async () => {
        if (!save) return;
        const path = RNFS.ExternalDirectoryPath + "/" + FN.telemetry;
        const stringifiedTele = JSON.stringify(telemetryToSave);
        RNFS.appendFile(path, stringifiedTele + ",")
          .then(() => {
            //
          })
          .catch((err) => {
            console.log(err.message);
          });
      })();
    });
    return function cleanup() {
      socket.off("allTelemetry");
    };
  }, [socket, hasStarted]);
  return [droneTele, gpsTele];
}
