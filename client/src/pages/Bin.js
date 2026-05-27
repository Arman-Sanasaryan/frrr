import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Quantility() {
  useEffect(() => {
    document.body.classList.add("quantility-mode");
    return () => {
      document.body.classList.remove("quantility-mode");
    };
  }, []);

  const node = (
    <div className="quantility-page">
      <div className="quantility-center">
        {/* <h1 className="quantility-greeting">soOn</h1> */}
        <input
          autoFocus
          className="quantility-input"
          aria-label="quantility-input"
          placeholder="soOn..."
          disabled
        />
      </div>
    </div>
  );

  return createPortal(node, document.body);
}