// src/ui/SectionHeader.jsx
import React from "react";

export default function SectionHeader({ title, subtitle }) {
  return (
    <div className="row space-between center-vert" style={{ marginBottom: 8 }}>
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle ? <div className="muted text-sm">{subtitle}</div> : null}
      </div>
    </div>
  );
}
