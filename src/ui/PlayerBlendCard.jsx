import React from "react";

const fmt = (n) => (n === null || n === undefined || Number.isNaN(Number(n)) ? "—" : (Math.round(Number(n) * 10) / 10));

export default function PlayerBlendCard({ name, pos, photo, teamLogo, categories = [] }) {
  return (
    <div className="pb-card">
      <img className="pb-team" src={teamLogo} alt="" />
      <div className="pb-head">
        <img className="pb-photo" src={photo} alt={name} />
        <div className="pb-name">
          <div className="n">{name}</div>
          <div className="p">{pos || "—"}</div>
        </div>
      </div>

      <div className="pb-table">
        <div className="pb-row pb-row--title">
          <div className="c">Cat</div>
          <div className="c">HA</div>
          <div className="c">Vs</div>
          <div className="c">Season</div>
          <div className="c">Blend</div>
        </div>

        {categories.map(({ cat, haLabel, ha, vsLabel, vs, season, blend }) => (
          <div className="pb-row" key={cat}>
            <div className="c cat">{cat}</div>
            <div className="c" title={haLabel}>{fmt(ha)}</div>
            <div className="c" title={vsLabel}>{fmt(vs)}</div>
            <div className="c">{fmt(season)}</div>
            <div className="c strong">{fmt(blend)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
