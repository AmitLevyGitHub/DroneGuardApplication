import React from "react";
import { Button, Text, TextInput } from "react-native";
//
import { RNFFmpeg } from "react-native-ffmpeg";
import RNFS from "react-native-fs";
import { RNS3 } from "react-native-aws3";
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
            accessKey: "", //"AKIAIYHUHJZSZVY2YB2Q",
            secretKey: "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",
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
            accessKey: "AKIAIYHUHJZSZVY2YB2Q",
            secretKey: "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",
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
    </React.Fragment>
  );
};

export default CropUploadStuff;
