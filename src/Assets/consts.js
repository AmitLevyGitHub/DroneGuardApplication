/**
 * toggle saving files
 */
export const shouldSave = {
  // tele: false,
  tele: false,
  // video: false,
  video: false,
};
export const isUploadDisabled = true;
export const forceUpload = false;
/**
 * navigation consts
 */
export const navConsts = {
  emergencyHeight: 10,
};
/**
 * telemetry socket
 */
export const telemetryDevice = {
  // ip: "192.168.68.118",
  ip: "192.168.0.100",
  // port: 2222,
  port: 3000,
};
/**
 * streaming & socket
 */
const streamDeviceDomain = "192.168.68.118";
// export const streamDeviceDomain = "192.168.68.134";
// export const streamDeviceDomain = "192.168.68.132";
// export const streamDeviceDomain = "10.100.102.12";
// export const streamDeviceDomain = "192.168.0.115";
export const streamingDevice = {
  ip: streamDeviceDomain,
  url: `rtsp://${streamDeviceDomain}:6554/stream1`,
};
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
 * files & directories names
 */
const videoFormat = "avi";
export const FN = {
  video: `streamVideo.${videoFormat}`,
  telemetry: "allTelemetry.txt",
  events: "emergencyEvents.txt",
  logger: "logger.txt",
  appErrors: "appErrors.txt",
  eventDirectory: "eventDirectory",
};
/**
 * async storage keys
 */
export const AS = {
  userToken: "@userToken",
  uploadStatus: "@uploadStatus",
  //
  emergencyEvent: "@emergencyEvent",
};
