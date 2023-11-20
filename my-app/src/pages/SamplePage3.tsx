import React from "react";
import { useLocation } from "react-router-dom";

export default function SamplePage3():React.VFC {
  const location = useLocation();
  console.log("location",  location,  location.state);
  return (
    <>
      <h3>Sample Page 3</h3>
      
    </>);
}
