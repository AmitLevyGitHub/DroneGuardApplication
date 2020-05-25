import React from "react";

export default function useUploadEvents(isPreparing, eventsStatus) {
  const [currentEvent, setCurrentEvent] = React.useState({ index: -1 });
  React.useEffect(() => {
    if (isPreparing) return;
    (async () => {
      for (let i = 0; i < eventsStatus.length; i++) {
        const event = { ...eventsStatus[i] };
        setCurrentEvent(event);
        await handleEventFake(event);
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
async function handleEvent(event) {
  
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
  if (!)
  //trim
  /**
   *
   */
  //create thumbnail
  //cut telemetry
  //
}
