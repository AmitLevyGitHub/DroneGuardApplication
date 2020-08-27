import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { telemetryDevice } from "../Assets/consts";
import logger from "../logger";
const caller = "useSocket.js";

export default function useSocket() {
  const [socket, setSocket] = React.useState(null);
  const [lifeBeltSocket, setLifeBeltSocket] = useState(null);

  React.useEffect(() => {
    const socketServerURL = `http://${telemetryDevice.ip}:${telemetryDevice.port}`;
    const socketServerReleaseUrl = `http://${telemetryDevice.ip}:${telemetryDevice.lifeBeltPort}`;

    logger("DEV", `creating socket to ${socketServerURL}`, caller);
    logger("DEV", `creating socket to ${socketServerReleaseUrl}`, caller);
    let tSocket = socketIOClient(socketServerURL);
    let tLifeBeltSocket = socketIOClient(socketServerReleaseUrl);
    setSocket(tSocket);
    setLifeBeltSocket(tLifeBeltSocket);

    tSocket.emit("fromClient", "hello from react native DroneGuard app");
    return function cleanup() {
      socket && socket.disconnect();
      tSocket && tSocket.disconnect();
      tLifeBeltSocket && tLifeBeltSocket.disconnect();
      lifeBeltSocket && lifeBeltSocket.disconnect();
    };
  }, []);

  return [socket, lifeBeltSocket];
}
