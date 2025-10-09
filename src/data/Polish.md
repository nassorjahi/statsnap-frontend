# 🧠 NBA Dashboard – Premium & Future Feature Backlog (2025 Edition)

## 🏀 Player Dashboard Enhancements
### 1. Player Data Export (Pro Tier)
**Status:** Planned  
**Description:**  
Add a premium-tier export feature to the Player Dashboard that allows users to download the last *n* games (default: 10) for a selected player as a CSV file for offline review or deeper analytics.

**Details:**
- **Trigger:** Available only when both Team and Player are selected.
- **Output:** CSV including columns:
  `DATE`, `OPPONENT TEAM`, `PTS`, `REB`, `AST`, `3PM`, `STL`, `BLK`
- **UI:**  
  - Button: `⬇️ Export Last 10 Games (CSV)`
  - Tooltip: “Premium Feature — unlock advanced analytics export”
- **Tech Stack:**  
  - Use `papaparse` or `json2csv` for CSV generation.
  - Optional Excel (`.xlsx`) enhancement using `SheetJS`.
- **Future Expansion:**
  - Add premium-tier Excel export with player photo and team logo header.
  - Allow export of “Next Game Projections” and “Vs Opponent Summary”.

2. Smart Insights Engine
   - Auto-generates 3 plain-language insights per matchup.
   - Uses rolling averages and opponent trends.
   - Beginner-friendly phrasing.

3. Beginner Mode Toggle
   - Adds one-line explanations to all widgets.
   - Saves preference in localStorage.

4. Confidence Meter
   - Color-coded indicator of statistical consistency for totals or props.
6. Injury Report Integration

7. Injury Report System
Status: Implemented
Description:
  Adds live player injury feed scraped from CBS Sports every 6 hours.
  Cached locally and served via /api/injuries.
  Displays in TodayMatchups under Game Snapshot.
  Color-coded badges (🟢 Probable, 🟠 Questionable, 🔴 Out).
Future:
  - Integrate into Player Dashboard next to player photo.
  - Add "Impact Score" adjustments to projections.
  - Support NFL / MLB / NCAA injuries for future expansion.




Status: Planned
Description:
  Add live injury tracking for all NBA players.
  Source: CBS Sports or SportsData.io API.
  Updates twice daily and cached via backend.
Placement:
  - Game Snapshot section on Today’s Matchups
  - Player Dashboard beside player photo
  - Dedicated /injuries page for full list
Visuals:
  - Color-coded severity tags
  - Tooltip for injury type and return timeline
Future:
  - Tie injury status into betting projection adjustments
  - Add “Impact Score” weighting (e.g., -8 team rating when star is out)


*Document created: October 2025  
Maintained by: Dennis Watson / ChatGPT (GPT-5)*  
