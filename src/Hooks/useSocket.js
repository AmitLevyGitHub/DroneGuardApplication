import React from "react";
import * as dgram from "react-native-udp";
import { telemetryDevice } from "../Assets/consts";
//
export default function useSocket() {
  const [socket, setSocket] = React.useState(null);
  React.useEffect(() => {
    console.log("creating socket");
    const tSocket = dgram.createSocket("udp4");
    console.log("binding socket");
    tSocket.bind(telemetryDevice.port);
    tSocket.once("listening", () => {
      setSocket(tSocket);
      const msgToSend = Buffer.from(
        JSON.stringify({
          type: "fromClient",
          data: "hello from react native DroneGuard app",
        })
      );
      tSocket.send(
        msgToSend,
        0,
        msgToSend.length,
        telemetryDevice.port,
        telemetryDevice.ip,
        (err) => {
          if (err) {
            console.log("ERROR sending to server: " + err);
          } else {
            console.log("message sent to server");
          }
        }
      );
    });
    return function cleanup() {
      setSocket(null);
    };
  }, []);
  //
  return [socket];
}
