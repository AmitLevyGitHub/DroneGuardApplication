import React from "react";
import * as turf from "@turf/turf";
import { piCameraInfo } from "../Assets/consts";
export default function useNavigateDrone(socket, props) {
  const [axisX, setAxisX] = React.useState(-8000);
  const [axisY, setAxisY] = React.useState(-8000);
  const [isNavigating, setNavigating] = React.useState(false);
  const [showNavStatus, setShowNavStatus] = React.useState(false);
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
    if (axisX <= -8000 || axisY <= -8000) return;
    /**
     * utility functions for navigation computations
     */
    function calcFootprint() {
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
    function calcDiagonalAndBearing(footprintCM) {
      const videoSizePX = {
        //this variable is for uniformity with footprintCM
        widthPX: props.scaledWidth,
        heightPX: props.scaledHeight,
      };
      const widthToDstCM = Math.abs(
        axisX * (footprintCM.widthCM / videoSizePX.widthPX)
      );
      const heightToDstCM = Math.abs(
        axisY * (footprintCM.heightCM / videoSizePX.heightPX)
      );
      //
      const diagonal = Math.sqrt(
        Math.pow(widthToDstCM, 2) + Math.pow(heightToDstCM, 2)
      );
      //
      let quadrant = -1;
      if (axisX >= 0 && axisY >= 0) {
        quadrant = 0;
      } else if (axisX >= 0 && axisY < 0) {
        quadrant = 90;
      } else if (axisX < 0 && axisY < 0) {
        quadrant = 180;
      } else if (axisX < 0 && axisY >= 0) {
        quadrant = 270;
      }
      const bearing =
        (Math.atan(heightToDstCM / widthToDstCM) * (180 / Math.PI) +
          quadrant +
          props.droneBearing) %
        360;
      //
      console.log(`
        heightToDstCM = ${heightToDstCM}
        widthToDstCM = ${widthToDstCM}
        dstDiagonalCM = ${diagonal}
        dstBearing = ${bearing}
      `);
      return {
        dstDiagonalCM: diagonal,
        dstBearing: bearing,
      };
    }
    function calcDstCoordinate(diagonal, bearing) {
      const centerPoint = turf.point([
        props.centerCoordinate.lat,
        props.centerCoordinate.lon,
      ]);
      const diagonalKM = diagonal / 100000;
      const destination = turf.destination(centerPoint, diagonalKM, bearing);
      console.log(`
        dstCoordinate.lat = ${destination.geometry.coordinates[0]}
        dstCoordinate.lon = ${destination.geometry.coordinates[1]}
      `);
      return {
        lat: destination.geometry.coordinates[0],
        lon: destination.geometry.coordinates[1],
      };
    }
    /**
     * navigation command to server
     * UI is blocked until 'navFinished' event is emitted from server
     */
    setNavigating(true);
    console.log(`
      starting navigation with data from drone:
      props.droneHeightCM = ${props.droneHeightCM}
      props.scaledWidth = ${props.scaledWidth}
      props.scaledHeight = ${props.scaledHeight}
      props.droneBearing = ${props.droneBearing}
      props.centerCoordinate.lat = ${props.centerCoordinate.lat}
      props.centerCoordinate.lon = ${props.centerCoordinate.lon}
    `);
    const footprintCM = calcFootprint();
    const { dstDiagonalCM, dstBearing } = calcDiagonalAndBearing(footprintCM);
    const dstCoordinate = calcDstCoordinate(dstDiagonalCM, dstBearing);
    socket.emit("navigateTo", {
      targetCoordinate: dstCoordinate,
      dstDiagonalCM,
      dstBearing,
    });
    /**
     * cleanup
     */
    return function cleanup() {
      //
    };
  }, [axisX, axisY]);
  /**
   * React Native Modal can't show for a given time
   * need to do it with state change
   */
  React.useEffect(() => {
    let showStatusTimeout = null;
    const showStatusTime = 5000;
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
  return [setAxisX, setAxisY, isNavigating, showNavStatus, navigationStatus];
}