/**
 * toggle saving files
 */
export const shouldSave = {
  tele: true,
  video: true,
};
/**
 * upload screen
 */
export const isUploadDisabled = true;
export const forceUpload = false;
/**
 * navigation consts
 */
export const navConsts = {
  emergencyHeight: 600,
};
/**
 * telemetry socket
 */
export const telemetryDevice = {
  // ip: "192.168.68.118",
  // ip: "10.100.102.17",
  ip: "192.168.0.151",
  // port: 2222,
  port: 3000,
  lifeBeltPort: 5000,
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
export const Screens = {
  load: "load",
  login: "login",
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
  eventPrefix: "event",
  //
  events: "emergencyEvents.txt",
  appErrors: "appErrors.txt",
};
/**
 * async storage keys
 */
export const AS = {
  userToken: "@userToken",
  lifeGuardId: "@lifeGuardId",
  lifeGuardImage: "@lifeGuardImage",
  beachId: "@beachId",
  uploadStatus: "@uploadStatus",
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

export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const StyleConsts = {
  logo: {
    width: 490 / 6,
    height: 367 / 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
  },
  backgroundContainerStyle: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    backgroundPosition: "cover",
  },
  modal: {
    width: 500,
    height: 400,
  },
  header: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 100,
    paddingLeft: 15,
    paddingRight: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },
};
