import React from "react";
import "./suggestionPanel.css";

export default function SuggestionPanel({
  title = "Suggested Lines",
  suggestions = [],
  row1Label = "Away Picks",
  row2Label = "Home Picks",
}) {
  const lines = (suggestions || []).slice(0, 10);
  const row1 = lines.slice(0, 5);
  const row2 = lines.slice(5, 10);

  if (!lines.length) return null;

  return (
    <div className="sp-card">
      <div className="sp-title">{title}</div>

      <div className="sp-rowWrap">
        <div className="sp-rowHeader">{row1Label}</div>
        <div className="sp-row">
          {row1.map((s, i) => (
            <div key={`r1-${i}`} className="sp-chip" title={s}>
              <span className="sp-dot" />
              <span className="sp-text">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="sp-rowWrap">
        <div className="sp-rowHeader">{row2Label}</div>
        <div className="sp-row">
          {row2.map((s, i) => (
            <div key={`r2-${i}`} className="sp-chip" title={s}>
              <span className="sp-dot alt" />
              <span className="sp-text">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
