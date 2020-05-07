import React from "react";
export default function useDroneData() {
  const [heightCM] = React.useState(200);
  const [centerCoordinate] = React.useState({ lat: 32.16857, lon: 34.82266 });
  const [bearing] = React.useState(0);
  //
  return [heightCM, centerCoordinate, bearing];
}
