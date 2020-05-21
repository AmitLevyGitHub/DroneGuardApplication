/**
 * streaming & socket
 */
// export const streamDeviceDomain = "192.168.68.134";
// export const streamDeviceDomain = "192.168.68.132";
// export const streamDeviceDomain = "10.100.102.12";
export const streamDeviceDomain = "192.168.68.132";
// export const streamDeviceDomain = "192.168.0.115";
const socketServerPort = 4001;
export const socketServerURL = `http://${streamDeviceDomain}:${socketServerPort}`;
export const streamURL = `rtsp://${streamDeviceDomain}:6554/stream1`;
// export const streamURL = `rtmp://${streamDeviceDomain}/live/myVideo`;
/**
 * camera details
 */
function lenFormula(f, Dxy) {
  function F(n) {
    return parseFloat(n);
  }
  function toDEG(rad) {
    return F(F(rad) * F(180 / Math.PI));
  }
  const rad = F(2 * Math.atan(F(Dxy / F(f * 2))));
  const deg = toDEG(rad);
  return { rad, deg };
}
export const piCameraInfo = {
  focalLength: 3.6, //mm
  xDimensions: 3.6, //mm
  yDimensions: 2.7, //mm
  horizontalDegree: { ...lenFormula(3.6, 3.6) },
  verticalDegree: { ...lenFormula(3.6, 2.7) },
};
/**
 * navigation consts
 */
export const navConsts = {
  emergencyHeight: 10,
};
/**
 * screens
 */
export const S = {
  load: "load",
  login: "login",
  home: "home",
  stream: "stream",
  upload: "upload",
};
/**
 * files names
 */
export const FN = {
  telemetry: "tele.txt",
  logger: "logger.txt",
  appErrors: "appErrors.txt",
};
/**
 * async storage keys
 */
export const AS = {
  emergencyEvent: "@emergencyEvent",
  userToken: "@userToken",
  uploadStatus: "@uploadStatus",
};
