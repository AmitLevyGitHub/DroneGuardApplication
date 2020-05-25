import React from "react";

export default function useUploadEvents(isPreparing, eventsStatus) {
  const [currentEvent, setCurrentEvent] = React.useState({ index: -1 });
  React.useEffect(() => {
    if (isPreparing) return;
    (async () => {
      let isError = false;
      for (let i = 0; i < eventsStatus.length; i++) {
        const event = { ...eventsStatus[i] };
        setCurrentEvent(event);
        try {
          await handleEventFake(event);
        } catch (error) {
          isError = true;
        }
      }
      //
      if (!isError) {
        //clear AS.uploadStatus
      }
    })();
  }, [isPreparing, eventsStatus]);
  //
  return [currentEvent];
}
async function handleEventFake(event) {
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  await sleep(2000);
}
function handleEvent(event) {
  return new Promise(async (resolve, reject) => {
    /**
     * create event in DB
     */
    if (!event.ID) {
      //create
      //remember eventID
      //create event directory on device
    }
    /**
     * trim video
     */
    // if (!)
    //trim
    /**
     *
     */
    //create thumbnail
    //cut telemetry
    //
    /**
     * create directory on device
create event in DB

cut telemetry
upload telemetry
update telemetry in DB

create screenshot
upload screenshot
update screenshot in DB

trim video
upload video
update video in DB
     */
  });
}
