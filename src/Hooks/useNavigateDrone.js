import React from "react";
import * as turf from "@turf/turf";
import { piCameraInfo } from "../Assets/consts";
export default function useNavigateDrone(socket, props) {
  const [axisX, setAxisX] = React.useState(-8000);
  const [axisY, setAxisY] = React.useState(-8000);
  const [navCommand, setNavCommand] = React.useState("none");
  const [isNavigating, setNavigating] = React.useState(false);
  const [showNavStatus, setShowNavStatus] = React.useState(false);
  const [navigatingModalClosable, setClosable] = React.useState(false);
  const [navigationStatus, setNavigationStatus] = React.useState({
    status: false,
    startTime: -1,
    finishTime: -1,
    navigationTime: -1,
    targetCoordinate: { lat: -1, lon: -1 },
    totalDistance: -1,
    reachedCoordinate: { lat: -1, lon: -1 },
    reasons: ["you should not see this 1", "you should not see this 2"],
  });
  //
  //socket callback
  React.useEffect(() => {
    if (!socket) return;
    // if (!socket.connected) return;
    console.log("in useNavigateDrone will define socket.on()");
    socket.on("navFinished", (navData) => {
      console.log(
        `navFinished with navData = ${JSON.stringify(navData, null, 2)}`
      );
      setNavigationStatus({ ...navData });
      //
      console.log("will set showNavStatus to true");
      setShowNavStatus(true);
      setNavigating(false);
    });
  }, [socket]); /** [socket] */
  //
  //navigation
  React.useEffect(() => {
    if ((axisX <= -8000 || axisY <= -8000) && navCommand === "none") return;
    /**
     * handle not connected modal!
     */
    if (!socket) return;
    if (!socket.connected) {
      if (navCommand !== "none") {
        console.log(
          `trying to emit type: ${navCommand} but socket not connected`
        );
      } else {
        console.log(`trying to emit type: press but socket not connected`);
      }
      setNavCommand("none");
      setAxisX(-8001);
      setAxisY(-8001);
      return;
    }
    /**
     * UI is blocked until 'navFinished' event is emitted from server
     * or until specific time passes
     */
    let closeableTimeout = null;
    setClosable(false);
    setNavigating(true);
    const closableWaitTime = 3000;
    closeableTimeout = setTimeout(() => {
      setClosable(true);
    }, closableWaitTime);
    /**
     * default commands
     */
    if (navCommand !== "none") {
      console.log(`emitting type: ${navCommand} to server`);
      socket.emit("command", { type: navCommand });
      setNavCommand("none");
      setAxisX(-8001);
      setAxisY(-8001);
    } else {
      /**
       * press commands
       */
      console.log(`
      starting navigation with data from drone:
      props.droneHeightCM = ${props.droneHeightCM}
      props.scaledWidth = ${props.scaledWidth}
      props.scaledHeight = ${props.scaledHeight}
      props.droneBearing = ${props.droneBearing}
      props.centerCoordinate.lat = ${props.centerCoordinate.lat}
      props.centerCoordinate.lon = ${props.centerCoordinate.lon}
    `);
      const footprintCM = calcFootprint(props);
      const {
        dstDiagonalCM,
        dstBearing,
        degree,
        x,
        y,
      } = calcDiagonalAndBearing(footprintCM, props, axisX, axisY);
      // const dstCoordinate = calcDstCoordinate(dstDiagonalCM, dstBearing, props);
      console.log("emitting type: press to server");
      socket.emit("command", {
        type: "press",
        distance: dstDiagonalCM,
        degree,
        x,
        y,
      });
    }
    setNavCommand("none");
    setAxisX(-8001);
    setAxisY(-8001);
  }, [axisX, axisY, navCommand]);
  /**
   * React Native Modal can't show itself for a given time
   * must do it with explicit state change
   */
  React.useEffect(() => {
    let showStatusTimeout = null;
    const showStatusTime = 5000;
    let isSubscribed;
    if (showNavStatus) {
      (async () => {
        isSubscribed = true;
        await new Promise((resolve) => {
          showStatusTimeout = setTimeout(() => {
            return resolve(true);
          }, showStatusTime);
        });
        isSubscribed && setShowNavStatus(false);
      })();
    }
    return function cleanup() {
      isSubscribed = false;
      if (showStatusTimeout) clearTimeout(showStatusTimeout);
    };
  }, [showNavStatus]);
  /**
   * return..
   */
  return [
    setAxisX,
    setAxisY,
    isNavigating,
    showNavStatus,
    navigationStatus,
    navigatingModalClosable,
    setNavCommand,
  ];
}
/**
 * utility functions for navigation computations
 */
function calcFootprint(props) {
  const h = props.droneHeightCM;
  const fpWidth = Math.tan(piCameraInfo.horizontalDegree.rad / 2) * 2 * h;
  const fpHeight = Math.tan(piCameraInfo.verticalDegree.rad / 2) * 2 * h;
  console.log(`
        footprint width (cm) = ${fpWidth}
        footprint height (cm) = ${fpHeight}
      `);
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
  console.log(`
        heightToDstCM = ${heightToDstCM}
        widthToDstCM = ${widthToDstCM}
        dstDiagonalCM = ${diagonal}
        dstBearing = ${bearing}
        clickDegree = ${degree}
      `);
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
  console.log(`
        dstCoordinate.lat = ${destination.geometry.coordinates[1]}
        dstCoordinate.lon = ${destination.geometry.coordinates[0]}
      `);
  return {
    lat: destination.geometry.coordinates[1],
    lon: destination.geometry.coordinates[0],
  };
}
