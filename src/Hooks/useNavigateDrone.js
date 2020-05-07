import React from "react";
import * as turf from "@turf/turf";
import { piCameraInfo } from "../../Assets/consts";
export default function useNavigateDrone(props) {
  const [axisX, setAxisX] = React.useState(-8000);
  const [axisY, setAxisY] = React.useState(-8000);
  const [isNavigating, setNavigating] = React.useState(false);
  const [showNavStatus, setShowNavStatus] = React.useState(false);
  const [navigationStatus, setNavigationStatus] = React.useState({
    status: false,
    reasons: ["you should not see this 1", "you should not see this 2"],
    navigationTime: -1,
    totalDistance: -1,
    targetCoordinate: { lat: -1, lon: -1 },
    reachedCoordinate: { lat: -1, lon: -1 },
  });
  /**
   * connect socket
   * handle emitted events from server
   */
  // React.useEffect(() => {
  //   const socket = null; //connect to server
  //   socket.on('navigationFinished', data => {
  //     setNavigating(false);
  //     setNavigationStatus({...data});
  //     setShowNavStatus(true);
  //   })
  //   return function cleanup() {
  //     //clean socket connection
  //   }
  // }, []);
  /**
   * handle navigation
   * socket.emit('startNavigation', {data})
   */
  React.useEffect(() => {
    if (axisX <= -8000 || axisY <= -8000) return;
    let isSubscribed = false;
    /**
     * FAKE API
     */
    let timeout0 = null;
    function getRndInteger(min, max) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    function fakeDroneNavigation(navigationShould, data) {
      return new Promise((resolve, reject) => {
        const baseTime = 2000;
        const randTime = getRndInteger(baseTime, baseTime * 3);
        if (navigationShould === "success") {
          timeout0 = setTimeout(() => {
            return resolve({
              reasons: [],
              navigationTime: randTime,
              totalDistance: data.distanceCM,
              targetCoordinate: data.dstCoordinate,
              reachedCoordinate: data.dstCoordinate,
            });
          }, randTime);
        }
        if (navigationShould === "fail") {
          timeout0 = setTimeout(() => {
            return reject({
              reasons: ["something1 happened", "something2 happened"],
              navigationTime: randTime,
              totalDistance: data.distanceCM,
              targetCoordinate: data.dstCoordinate,
              reachedCoordinate: data.dstCoordinate,
            });
          }, randTime);
        }
      });
    }
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
      //this variable is for uniformity with footprintCM
      const videoSizePX = {
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
        dstDiagonal = ${diagonal}
        dstBearing = ${bearing}
      `);
      return {
        dstDiagonal: diagonal,
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
     * fake emit navigation command to drone
     * UI will wait for it to end!
     */
    (async () => {
      isSubscribed = true;
      setNavigating(true);
      try {
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
        const { dstDiagonal, dstBearing } = calcDiagonalAndBearing(footprintCM);
        const dstCoordinate = calcDstCoordinate(dstDiagonal, dstBearing);
        const navStatus = await fakeDroneNavigation("success", {
          distanceCM: dstDiagonal,
          bearing: dstBearing,
          dstCoordinate,
        });
        isSubscribed &&
          setNavigationStatus({
            status: true,
            ...navStatus,
          });
      } catch (error) {
        isSubscribed &&
          setNavigationStatus({
            status: false,
            ...error,
          });
      }
      console.log("will set showNavStatus to true");
      isSubscribed && setShowNavStatus(true);
      isSubscribed && setNavigating(false);
    })();
    /**
     * cleanup
     */
    return function cleanup() {
      isSubscribed = false;
      if (timeout0) clearTimeout(timeout0);
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
