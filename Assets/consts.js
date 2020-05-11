export const streamDeviceDomain = "192.168.68.131";
export const streamURL = `rtmp://${streamDeviceDomain}/live/myVideo`;
// export const streamURL = `rtsp://${streamDeviceDomain}/live/myVideo`;
// export const streamURL = "rtmp://127.0.0.1:1935/appName/streamName";
// export const streamURL = `rtp://${streamDeviceDomain}`;
// export const streamURL = `rtmp://${streamDeviceDomain}/appName/streamName`;
// export const streamURL = `rtsp://${streamDeviceDomain}:6554/stream1`;
//
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
