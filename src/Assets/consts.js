/**
 * toggle saving files
 */
export const shouldSave = {
  tele: true,
  video: true,
};
export const isUploadDisabled = true;
export const forceUpload = false;
/**
 * navigation consts
 */
export const navConsts = {
  emergencyHeight: 249,
};
/**
 * telemetry socket
 */
export const telemetryDevice = {
  // ip: "192.168.68.118",
  ip: "192.168.0.150",
  // port: 2222,
  port: 3000,
};
/**
 * streaming & socket
 */
const streamDeviceDomain = "192.168.0.150";
// const streamDeviceDomain = "192.168.10.1";
export const streamingDevice = {
  ip: streamDeviceDomain,
  url: `rtsp://${streamDeviceDomain}:8160/`,
  // url: `udp://${streamDeviceDomain}:11111`,
  // url: "http://clips.vorwaerts-gmbh.de/big_buck_bunny.mp4"
};
/**
 * screens
 */
export const S = {
  load: "load",
  login: "login",
  beaches: "beaches",
  home: "home",
  stream: "stream",
  upload: "upload",
};
/**
 * files & directories names
 */
const videoFormat = "mp4";
export const FN = {
  video: `streamVideo.${videoFormat}`,
  telemetry: "allTelemetry.txt",
  logger: "logger.txt",
  appErrors: "appErrors.txt",
  eventPrefix: "event",
  //
  events: "emergencyEvents.txt",
};
/**
 * async storage keys
 */
export const AS = {
  userToken: "@userToken",
  lifeGuardId: "@lifeGuardId",
  beachId: "@beachId",
  uploadStatus: "@uploadStatus",
  //
  emergencyEvent: "@emergencyEvent",
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
