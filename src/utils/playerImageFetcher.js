// ------------------------------------------------------------
// ✅ PLAYER IMAGE FETCHER UTILS (Updated Oct 2025)
// ------------------------------------------------------------
// Handles ESPN player headshots with fallback logic
// ------------------------------------------------------------

export const PLACEHOLDER_URL =
  "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png";

/**
 * Returns ESPN headshot URL by player ID.
 * Example: https://a.espncdn.com/i/headshots/nba/players/full/3998845.png
 */
export const getPlayerHeadshot = (id) => {
  if (!id) return PLACEHOLDER_URL;
  return `https://a.espncdn.com/i/headshots/nba/players/full/${id}.png`;
};

/**
 * OnError fallback handler for <img> tags.
 */
export const imgOnErrorFallback = (e) => {
  e.target.src = PLACEHOLDER_URL;
};

/**
 * ✅ fetchEspnHeadshotUrl — primary async utility used by PlayerDashboard.jsx
 * Attempts to build a valid ESPN URL based on player name or ID.
 */
export async function fetchEspnHeadshotUrl(playerName, playerId) {
  try {
    // If ID provided — safest direct method
    if (playerId) {
      const url = getPlayerHeadshot(playerId);
      const res = await fetch(url, { method: "HEAD" });
      if (res.ok) return url;
    }

    // Try name-based lookup fallback (e.g., "LeBron James" → "lebron-james")
    if (playerName) {
      const formatted = playerName
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      const guessedUrl = `https://a.espncdn.com/i/headshots/nba/players/full/${formatted}.png`;
      const res2 = await fetch(guessedUrl, { method: "HEAD" });
      if (res2.ok) return guessedUrl;
    }

    // Final fallback: placeholder image
    return PLACEHOLDER_URL;
  } catch (err) {
    console.warn("⚠️ fetchEspnHeadshotUrl error:", err);
    return PLACEHOLDER_URL;
  }
}
