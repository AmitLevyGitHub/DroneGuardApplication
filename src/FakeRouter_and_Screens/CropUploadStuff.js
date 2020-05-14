import React from "react";
import { Button, Text, TextInput } from "react-native";
//
import { RNFFmpeg } from "react-native-ffmpeg";
import RNFS from "react-native-fs";
import { RNS3 } from "react-native-aws3";
import { AWSkeys } from "../Assets/secrets";
import AsyncStorage from "@react-native-community/async-storage";
import { emergencyEventKey } from "../Assets/consts";
//
const CropUploadStuff = () => {
  React.useEffect(() => {
    (async () => {
      const originalStat = await RNFS.stat(
        RNFS.ExternalDirectoryPath + "/streamVideo.h264"
      );
      console.log("originalStat = " + JSON.stringify(originalStat, null, 2));
      const convertedStat = await RNFS.stat(
        RNFS.ExternalDirectoryPath + "/converted.mp4"
      );
      console.log("convertedStat = " + JSON.stringify(convertedStat, null, 2));
      // const dirItems = await RNFS.readDir(RNFS.ExternalDirectoryPath);
      // console.log("dirItems = " + JSON.stringify(dirItems, null, 2));
      //
      //
      for (let i = 1; i <= 200; i++) {
        try {
          const eventKey = `${emergencyEventKey}_${i}`;
          const stringValue = await AsyncStorage.getItem(eventKey);
          if (!stringValue) {
            i = 201;
            break;
          }
          const jsonValue = stringValue ? JSON.parse(stringValue) : null;
          console.log(`${eventKey} = ${stringValue}`);
        } catch (e) {
          // error reading value
          i = 201;
        }
      }
    })();
  }, []);
  const [sTime, set_sTime] = React.useState("00");
  const [eTime, set_eTime] = React.useState("10");
  const [screenShotPos, setScreenShotPos] = React.useState("00:00:00");
  const [imageUploadName, setImageUpload] = React.useState(
    "screenShot_00:00:00.jpeg"
  );
  const [videoUploadName, setVideoUpload] = React.useState(
    "cutVideo_s00_e10.mp4"
  );
  const [teleUploadName, setTeleUpload] = React.useState("tele.json");
  const [teleStartTime, setTeleStartTime] = React.useState(-1);
  const [teleEndTime, setTeleEndTime] = React.useState(-1);
  //
  return (
    <React.Fragment>
      <Text style={{ fontSize: 20 }}>
        Convert full length original h264 to mp4
      </Text>
      {/** convert full length */}
      <Button
        title="convert H264 to mp4"
        onPress={async () => {
          const originalVideoPath =
            RNFS.ExternalDirectoryPath + "/streamVideo.h264";
          const convertedVideoPath =
            RNFS.ExternalDirectoryPath + "/converted.mp4";
          const FFMPEGcommand = `-framerate 24 -i ${originalVideoPath} -c copy ${convertedVideoPath}`;
          try {
            console.log(
              `converting video and saving it to ${convertedVideoPath}`
            );
            const command = FFMPEGcommand;
            const result = await RNFFmpeg.execute(command);
            console.log(
              "\n-\n-\n-\nFFmpeg process exited with rc " + result.rc
            );
          } catch (error) {
            console.log("\n\n\n\n\nFFMPEG execute error!");
            console.log(
              error.hasOwnProperty("message") ? error.message : error
            );
          }
        }}
      />
      {/** trim and convert */}
      <Text style={{ fontSize: 20 }}>Trim original h264 to mp4</Text>
      <Text>Start Position (seconds)</Text>
      <TextInput
        placeholder="Start Position Seconds"
        value={sTime}
        onChangeText={(t) => set_sTime(t)}
      />
      <Text>Duration</Text>
      <TextInput
        placeholder="End Position Seconds"
        value={eTime}
        onChangeText={(t) => set_eTime(t)}
      />
      <Button
        title="trim video"
        onPress={async () => {
          const cutVideoName = `cutVideo_s${sTime}_e${eTime}.mp4`;
          console.log(
            `cutting video from ${sTime} to ${eTime} and saving it with new name = ${cutVideoName}`
          );
          const cutVideoPath = RNFS.ExternalDirectoryPath + "/" + cutVideoName;
          const srcVideoPath = RNFS.ExternalDirectoryPath + "/streamVideo.h264";
          const FFMPEGcommand = `-i ${srcVideoPath} -vf trim=${sTime}:${eTime} ${cutVideoPath}`;
          try {
            console.log(`cutting video and saving it to ${cutVideoPath}`);
            const command = FFMPEGcommand;
            console.log(`executing FFMPEG command: ${command}`);
            const result = await RNFFmpeg.execute(command);
            console.log(
              "\n-\n-\n-\nFFmpeg process exited with rc " + result.rc
            );
          } catch (error) {
            console.log("\n\n\n\n\nFFMPEG execute error!");
            console.log(
              error.hasOwnProperty("message") ? error.message : error
            );
          }
        }}
      />
      {/** screen shot from mp4 video to jpeg image */}
      <Text style={{ fontSize: 20 }}>ScreenShot mp4 video</Text>
      <Text>Get screenshot from cutVideo_s00_e10.mp4 at position HH:MM:SS</Text>
      <TextInput
        placeholder="Screen Shot Position HH:MM:SS"
        value={screenShotPos}
        onChangeText={(t) => setScreenShotPos(t)}
      />
      <Button
        title="create screenshot"
        onPress={async () => {
          const srcVideoPath =
            RNFS.ExternalDirectoryPath + "/cutVideo_s00_e10.mp4";
          const screenShotName = `screenShot_${screenShotPos}.jpeg`;
          const screenShotPath =
            RNFS.ExternalDirectoryPath + "/" + screenShotName;
          console.log(
            `making screen shot of position ${screenShotPos} and saving it with new name = ${screenShotName}`
          );
          const FFMPEGcommand = `-ss ${screenShotPos} -i ${srcVideoPath} -vframes 1 -q:v 2 ${screenShotPath}`;
          try {
            console.log(
              `making screen shot and saving it to ${screenShotPath}`
            );
            const command = FFMPEGcommand;
            console.log(`executing FFMPEG command: ${command}`);
            const result = await RNFFmpeg.execute(command);
            console.log(
              "\n-\n-\n-\nFFmpeg process exited with rc " + result.rc
            );
          } catch (error) {
            console.log("\n\n\n\n\nFFMPEG execute error!");
            console.log(
              error.hasOwnProperty("message") ? error.message : error
            );
          }
        }}
      />
      {/** image upload */}
      <Text style={{ fontSize: 20 }}>Image Upload</Text>
      <Text>Image to upload with .extension</Text>
      <TextInput
        placeholder="Image To Upload With Extension!"
        value={imageUploadName}
        onChangeText={(t) => setImageUpload(t)}
      />
      <Button
        title="upload image"
        onPress={() => {
          const folder = RNFS.ExternalDirectoryPath;
          const file = {
            uri: `file://${folder}/${imageUploadName}`,
            name: imageUploadName,
            type: "image/jpeg",
          };
          const options = {
            keyPrefix: "uploads/",
            bucket: "drone-guard-videos",
            region: "eu-west-1",
            accessKey: AWSkeys.accessKey,
            secretKey: AWSkeys.secretKey,
            successActionStatus: 201,
          };
          console.log(`uploading ${imageUploadName} to bucket!`);

          RNS3.put(file, options)
            .progress((event) => {
              console.log(`percentage uploaded: ${event.percent}`);
            })
            .then((res) => {
              if (res.status === 201) {
                console.log("response from successful upload to s3:", res.body);
                console.log("S3 URL", res.body.postResponse.location);
              } else {
                console.log("ERROR status code: ", res.status);
              }
            })
            .catch((err) => {
              console.log("ERROR uploading IMAGE to s3", err);
            });
        }}
      />
      {/** video upload */}
      <Text style={{ fontSize: 20 }}>Video Upload</Text>
      <Text>Video to upload with .extension</Text>
      <TextInput
        placeholder="Video To Upload With Extension!"
        value={videoUploadName}
        onChangeText={(t) => setVideoUpload(t)}
      />
      <Button
        title="upload video"
        onPress={() => {
          const folder = RNFS.ExternalDirectoryPath;
          const file = {
            uri: `file://${folder}/${videoUploadName}`,
            name: videoUploadName,
            type: "video/mp4",
          };
          const options = {
            keyPrefix: "uploads/",
            bucket: "drone-guard-videos",
            region: "eu-west-1",
            accessKey: AWSkeys.accessKey,
            secretKey: AWSkeys.secretKey,
            successActionStatus: 201,
          };
          console.log(`uploading ${videoUploadName} to bucket!`);

          RNS3.put(file, options)
            .progress((event) => {
              console.log(`percentage uploaded: ${event.percent}`);
            })
            .then((res) => {
              if (res.status === 201) {
                console.log("response from successful upload to s3:", res.body);
                console.log("S3 URL", res.body.postResponse.location);
              } else {
                console.log("ERROR status code: ", res.status);
              }
            })
            .catch((err) => {
              console.log("ERROR uploading VIDEO to s3", err);
            });
        }}
      />
      {/** telemetry upload */}
      <Text style={{ fontSize: 20 }}>Telemetry Upload</Text>
      <Text>Telemetry file to upload with .extension</Text>
      <TextInput
        placeholder="Telemetry To Upload With Extension!"
        value={teleUploadName}
        onChangeText={(t) => setTeleUpload(t)}
      />
      <Button
        title="upload telemetry"
        onPress={() => {
          const folder = RNFS.ExternalDirectoryPath;
          const file = {
            uri: `file://${folder}/${teleUploadName}`,
            name: teleUploadName,
            type: "application/json",
          };
          const options = {
            keyPrefix: "uploads/",
            bucket: "drone-guard-videos",
            region: "eu-west-1",
            accessKey: AWSkeys.accessKey,
            secretKey: AWSkeys.secretKey,
            successActionStatus: 201,
          };
          console.log(`uploading ${teleUploadName} to bucket!`);

          RNS3.put(file, options)
            .progress((event) => {
              console.log(`percentage uploaded: ${event.percent}`);
            })
            .then((res) => {
              if (res.status === 201) {
                console.log("response from successful upload to s3:", res.body);
                console.log("S3 URL", res.body.postResponse.location);
              } else {
                console.log("ERROR status code: ", res.status);
              }
            })
            .catch((err) => {
              console.log("ERROR uploading VIDEO to s3", err);
            });
        }}
      />
      {/** clear asyncStorage */}
      <Text style={{ fontSize: 20 }}>Clear ALL keys in asyncStorage</Text>
      <Button
        title="clear all keys in asyncStorage"
        onPress={() => {
          AsyncStorage.clear();
        }}
      />
      {/** trim telemetry */}
      <Text style={{ fontSize: 20 }}>Trim Telemetry</Text>
      <Text>Start Time (utc timestamp in ms)</Text>
      <TextInput
        placeholder="Start Time (utc timestamp in ms)"
        value={sTime}
        onChangeText={(t) => setTeleStartTime(t)}
      />
      <Text>End Time (utc timestamp in ms)</Text>
      <TextInput
        placeholder="End Time (utc timestamp in ms)"
        value={eTime}
        onChangeText={(t) => setTeleEndTime(t)}
      />
      <Button
        title="trim telemetry"
        onPress={async () => {
          const cutTelemetryName = `cutTelemetry_s${teleStartTime}_e${teleEndTime}.mp4`;
          console.log(
            `cutting telemetry from ${teleStartTime} to ${teleEndTime} and saving it with new name = ${cutTelemetryName}`
          );
          const cutTelemetryPath =
            RNFS.ExternalDirectoryPath + "/" + cutTelemetryName;
          const srcTelemetryPath = RNFS.ExternalDirectoryPath + "/tele.txt";
          try {
            // const dataRead = await RNFS.read(srcTelemetryPath, 1, 0);
            let dataRead = "";
            dataRead = await RNFS.readFile(srcTelemetryPath);
            dataRead = dataRead.substring(0, dataRead.length - 1);
            dataRead = "[" + dataRead + "]";
            // console.log(dataRead);
            const dataObj = JSON.parse(dataRead);
            console.log(`tele count = ${dataObj.length}`);
          } catch (e) {
            console.log(
              `ERROR reading file tele.txt: ${
                e.hasOwnProperty("message") ? e.message : e
              }`
            );
          }
        }}
      />
    </React.Fragment>
  );
};

export default CropUploadStuff;
