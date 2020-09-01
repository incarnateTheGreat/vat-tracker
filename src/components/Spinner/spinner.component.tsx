import React from "react";

export const Spinner = ({ isEnabled }) => {
  return (
    <div className={`spinner ${isEnabled ? "spinner-enabled" : ""}`.trim()}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
};
