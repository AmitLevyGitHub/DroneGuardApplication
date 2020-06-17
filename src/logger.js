/**
 * TO-DO: integrate RNFFmpeg default logs
 */
import RNFS from "react-native-fs";
import { FN } from "./Assets/consts";
const path = RNFS.ExternalDirectoryPath + "/" + FN.logger;
const ENV = "dev"; //"prod"
const consoleLogDummy = true; //false
const writeDevLevelLogs = true; //false
/**
 * DUMMY      -   debugging stuff, code flow
 * DEV        -   API requests, API requests success,
 *                socket.emit, socket.on (success)
 * WARNING    -   failure that the user can resolve or try again
 * ERROR      -   write, read, trim, upload
 * OPERATION  -   press & predefined commands
 */
/**
 * logger
 * @param {('DUMMY' | 'DEV' | 'WARNING' | 'ERROR' | 'OPERATION')} level
 * @param {string} msg
 * @param {string} caller
 */
export default function logger(level, msg, caller, subCaller = null) {
  const lvlCap = level.toUpperCase();
  if (!consoleLogDummy && lvlCap === "DUMMY") {
    return;
  }
  //log to console
  const time = Date.now();
  if (ENV === "dev") {
    let m = `${lvlCap}  --  ${caller}`;
    if (subCaller) {
      m += `  --  ${subCaller}`;
    }
    m += `  ${time}  --  ${new Date()}\n${msg}`;
    console.log(m);
  }
  //
  if (lvlCap === "DUMMY") {
    return;
  }
  if (lvlCap === "DEV" && !writeDevLevelLogs) {
    return;
  }
  //log to file
  const logToWrite = JSON.stringify({
    level: lvlCap,
    caller,
    subCaller,
    time,
    msg,
  });
  RNFS.appendFile(path, logToWrite + ",")
    .then(() => {
      //
    })
    .catch((e) => {
      const m = e.hasOwnProperty("message") ? e.message : e;
      console.log(`LOG  --  logger\n${m}`);
    });
}
