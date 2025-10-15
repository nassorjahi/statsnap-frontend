// src/data/teamData.js

// 🏀 API endpoint for local server
export const API_URL = "https://statsnap-backend.onrender.com";


// ✅ ESPN team logo codes
export const espnLogoCode = {
  "Atlanta Hawks": "atl",
  "Boston Celtics": "bos",
  "Brooklyn Nets": "bkn",
  "Charlotte Hornets": "cha",
  "Chicago Bulls": "chi",
  "Cleveland Cavaliers": "cle",
  "Dallas Mavericks": "dal",
  "Denver Nuggets": "den",
  "Detroit Pistons": "det",
  "Golden State Warriors": "gsw",
  "Houston Rockets": "hou",
  "Indiana Pacers": "ind",
  "LA Clippers": "lac",
  "Los Angeles Lakers": "lal",
  "Memphis Grizzlies": "mem",
  "Miami Heat": "mia",
  "Milwaukee Bucks": "mil",
  "Minnesota Timberwolves": "min",
  "New Orleans Pelicans": "no",
  "New York Knicks": "ny",
  "Oklahoma City Thunder": "okc",
  "Orlando Magic": "orl",
  "Philadelphia 76ers": "phi",
  "Phoenix Suns": "phx",
  "Portland Trail Blazers": "por",
  "Sacramento Kings": "sac",
  "San Antonio Spurs": "sas",
  "Toronto Raptors": "tor",
  "Utah Jazz": "uta",
  "Washington Wizards": "was",
};

// 🎨 Official team gradients (used in UI cards, charts, etc.)
export const teamGradients = {
  "Atlanta Hawks": "radial-gradient(circle at center, #E03A3E, #C1D32F)",
  "Boston Celtics": "radial-gradient(circle at center, #007A33, #BA9653)",
  "Brooklyn Nets": "radial-gradient(circle at center, #000000, #3D3D3D)",
  "Charlotte Hornets": "radial-gradient(circle at center, #1D1160, #00788C)",
  "Chicago Bulls": "radial-gradient(circle at center, #CE1141, #000000)",
  "Cleveland Cavaliers": "radial-gradient(circle at center, #860038, #FDBB30)",
  "Dallas Mavericks": "radial-gradient(circle at center, #00538C, #002B5E)",
  "Denver Nuggets": "radial-gradient(circle at center, #0E2240, #FEC524)",
  "Detroit Pistons": "radial-gradient(circle at center, #C8102E, #1D42BA)",
  "Golden State Warriors": "radial-gradient(circle at center, #1D428A, #FDB927)",
  "Houston Rockets": "radial-gradient(circle at center, #CE1141, #000000)",
  "Indiana Pacers": "radial-gradient(circle at center, #002D62, #FDBB30)",
  "LA Clippers": "radial-gradient(circle at center, #C8102E, #1D428A)",
  "Los Angeles Lakers": "radial-gradient(circle at center, #552583, #FDB927)",
  "Memphis Grizzlies": "radial-gradient(circle at center, #5D76A9, #12173F)",
  "Miami Heat": "radial-gradient(circle at center, #98002E, #F9A01B)",
  "Milwaukee Bucks": "radial-gradient(circle at center, #00471B, #EEE1C6)",
  "Minnesota Timberwolves": "radial-gradient(circle at center, #0C2340, #236192)",
  "New Orleans Pelicans": "radial-gradient(circle at center, #0C2340, #C8102E)",
  "New York Knicks": "radial-gradient(circle at center, #006BB6, #F58426)",
  "Oklahoma City Thunder": "radial-gradient(circle at center, #007AC1, #F05133)",
  "Orlando Magic": "radial-gradient(circle at center, #0077C0, #C4CED4)",
  "Philadelphia 76ers": "radial-gradient(circle at center, #006BB6, #ED174C)",
  "Phoenix Suns": "radial-gradient(circle at center, #1D1160, #E56020)",
  "Portland Trail Blazers": "radial-gradient(circle at center, #E03A3E, #000000)",
  "Sacramento Kings": "radial-gradient(circle at center, #5A2D81, #63727A)",
  "San Antonio Spurs": "radial-gradient(circle at center, #C4CED4, #000000)",
  "Toronto Raptors": "radial-gradient(circle at center, #CE1141, #000000)",
  "Utah Jazz": "radial-gradient(circle at center, #002B5C, #F9A01B)",
  "Washington Wizards": "radial-gradient(circle at center, #002B5C, #E31837)",
};

// 🔤 Helper: shorten player position (F/G/C)
export const posLetter = (raw) => {
  if (!raw) return "";
  const c = raw.trim()[0]?.toUpperCase();
  return ["F", "G", "C"].includes(c) ? c : c || "";
};
