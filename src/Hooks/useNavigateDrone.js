import React from "react";
import * as turf from "@turf/turf";
import { piCameraInfo } from "../Assets/consts";
import logger from "../logger";
const caller = "useNavigateDrone.js";
const autoCloseTimeWhenFinished = 3000;
export default function useNavigateDrone(socket, props) {
  const [axisX, setAxisX] = React.useState(-8000);
  const [axisY, setAxisY] = React.useState(-8000);
  const [navCommand, setNavCommand] = React.useState("none");
  //
  const [isNavWorking, setIsNavWorking] = React.useState(false);
  const [navModalVisible, setNavModalVisible] = React.useState(false);
  const [navModalTitle, setNavModalTitle] = React.useState("Navigating");
  const [navStatus, setNavStatus] = React.useState(
    "Don't close this popup until confirmation"
  );
  /**
   * socket callback- called when navFinished emitted from server
   * auto close modal after specific time (must be done with explicit state change)
   */
  React.useEffect(() => {
    if (!socket) return;
    let isSubscribed = true;
    let autoCloseTimeout = null;
    socket.on("navFinished", (navData) => {
      setIsNavWorking(false);
      if (navData.status) {
        logger("DEV", navData.message, caller, "socket.on(navFinished)");
        setNavModalTitle("Navigation Success");
      } else {
        logger("ERROR", navData.message, caller, "socket.on(navFinished)");
        setNavModalTitle("Navigation Failed");
      }
      setNavStatus(navData.message);
      //auto close
      autoCloseTimeout = setTimeout(() => {
        isSubscribed && setNavModalVisible(false);
      }, autoCloseTimeWhenFinished);
    });
    return function cleanup() {
      isSubscribed = false;
      if (autoCloseTimeout) clearTimeout(autoCloseTimeout);
      socket.off("navFinished");
    };
  }, [socket]);
  /**
   * emit event to server
   * UI is blocked until 'navFinished' received
   * or until user closes modal
   */
  React.useEffect(() => {
    if ((axisX <= -8000 || axisY <= -8000) && navCommand === "none") return;
    if (!socket) return;
    if (!socket.connected) {
      const comm = navCommand !== "none" ? navCommand : "press";
      logger(
        "WARNING",
        "trying to emit but socket not connected",
        caller,
        `socket.emit(type: ${comm})`
      );
      setNavCommand("none");
      setAxisX(-8001);
      setAxisY(-8001);
      return;
    }
    //
    if (navCommand === "emergency") {
      socket.emit("command", { type: navCommand });
      logger("DEV", `socket.emit(type: ${navCommand})`, caller);
      setNavCommand("none");
      setAxisX(-8001);
      setAxisY(-8001);
      return;
    }
    //
    setNavModalVisible(true);
    setIsNavWorking(true);
    setNavStatus("Don't close this popup");
    if (navCommand !== "none") {
      socket.emit("command", { type: navCommand });
      logger("DEV", `socket.emit(type: ${navCommand})`, caller);
    } else {
      logger(
        "DUMMY",
        `starting navigation with data from drone:
        props.droneHeightCM = ${props.droneHeightCM}
        props.scaledWidth = ${props.scaledWidth}
        props.scaledHeight = ${props.scaledHeight}
        props.droneBearing = ${props.droneBearing}
        props.centerCoordinate.lat = ${props.centerCoordinate.lat}
        props.centerCoordinate.lon = ${props.centerCoordinate.lon} `,
        caller,
        "calculation for press command"
      );
      const footprintCM = calcFootprint(props);
      const {
        dstDiagonalCM,
        dstBearing,
        degree,
        x,
        y,
      } = calcDiagonalAndBearing(footprintCM, props, axisX, axisY);
      // const dstCoordinate = calcDstCoordinate(dstDiagonalCM, dstBearing, props);
      socket.emit("command", {
        type: "press",
        distance: dstDiagonalCM,
        degree,
        x,
        y,
      });
      logger("DEV", `socket.emit(type: ${navCommand})`, caller);
    }
    setNavCommand("none");
    setAxisX(-8001);
    setAxisY(-8001);
  }, [axisX, axisY, navCommand]);
  /**
   * return..
   */
  return [
    setAxisX,
    setAxisY,
    setNavCommand,
    isNavWorking,
    navModalVisible,
    setNavModalVisible,
    navModalTitle,
    navStatus,
  ];
}
/**
 * utility functions for navigation computations
 */
function calcFootprint(props) {
  const h = props.droneHeightCM;
  const fpWidth = Math.tan(piCameraInfo.horizontalDegree.rad / 2) * 2 * h;
  const fpHeight = Math.tan(piCameraInfo.verticalDegree.rad / 2) * 2 * h;
  logger(
    "DUMMY",
    `footprint width (cm) = ${fpWidth}
    footprint height (cm) = ${fpHeight}`,
    caller,
    "calcFootprint()"
  );
  return {
    widthCM: fpWidth,
    heightCM: fpHeight,
  };
}
function calcDiagonalAndBearing(footprintCM, props, axisX, axisY) {
  const videoSizePX = {
    //this variable is for uniformity with footprintCM
    widthPX: props.scaledWidth,
    heightPX: props.scaledHeight,
  };
  let widthToDstCM = Math.abs(
    axisX * (footprintCM.widthCM / videoSizePX.widthPX)
  );
  let heightToDstCM = Math.abs(
    axisY * (footprintCM.heightCM / videoSizePX.heightPX)
  );
  let x = widthToDstCM;
  let y = heightToDstCM;
  if (axisX < 0) x = widthToDstCM * -1;
  if (axisY < 0) y = heightToDstCM * -1;
  //
  const diagonal = Math.sqrt(
    Math.pow(widthToDstCM, 2) + Math.pow(heightToDstCM, 2)
  );
  //
  let degree = (Math.atan2(axisX, axisY) * 180) / Math.PI;
  if (degree < 0) degree = 360 + degree;
  const bearing = (degree + props.droneBearing) % 360;
  //
  logger(
    "DUMMY",
    `heightToDstCM = ${heightToDstCM}
    widthToDstCM = ${widthToDstCM}
    dstDiagonalCM = ${diagonal}
    dstBearing = ${bearing}
    clickDegree = ${degree}`,
    caller,
    "calcDiagonalAndBearing()"
  );
  return {
    dstDiagonalCM: diagonal,
    dstBearing: bearing,
    degree,
    x,
    y,
  };
}
function calcDstCoordinate(diagonal, bearing, props) {
  const centerPoint = turf.point([
    props.centerCoordinate.lon,
    props.centerCoordinate.lat,
  ]);
  const diagonalKM = diagonal / 100000;
  const destination = turf.destination(centerPoint, diagonalKM, bearing);
  logger(
    "DUMMY",
    `dstCoordinate.lat = ${destination.geometry.coordinates[1]}
    dstCoordinate.lon = ${destination.geometry.coordinates[0]}`,
    caller,
    "calcDstCoordinate()"
  );
  return {
    lat: destination.geometry.coordinates[1],
    lon: destination.geometry.coordinates[0],
  };
}
