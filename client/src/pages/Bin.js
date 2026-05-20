import React, { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Bin() {
  useEffect(() => {
    document.body.classList.add("bin-mode");
    return () => {
      document.body.classList.remove("bin-mode");
    };
  }, []);

  const node = (
    <div className="bin-page">
      <div className="bin-center">
        {/* <h1 className="bin-greeting">soOn</h1> */}
        <input
          autoFocus
          className="bin-input"
          aria-label="bin-input"
          placeholder="soOn"
          disabled
        />
      </div>
    </div>
  );

  return createPortal(node, document.body);
}