import React from "react";
import socketIOClient from "socket.io-client";
import { socketServerURL } from "../Assets/consts";
export default function useTelemetry() {
  const [socket, setSocket] = React.useState(null);
  React.useEffect(() => {
    //connection
    console.log(`will create socket to ${socketServerURL}`);
    tSocket = socketIOClient(socketServerURL);
    setSocket(tSocket);
    //emit hello / securing connection
    tSocket.emit("fromClient", "hello from react native DroneGuard app");
    return function cleanup() {
      if (socket) {
        socket.disconnect();
        console.log("socket disconnected");
      }
    };
  }, []);
  //
  return [socket];
}
