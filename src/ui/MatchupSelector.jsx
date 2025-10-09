import React from "react";

const MatchupSelector = ({ games, selectedGame, onChange }) => {
  return (
    <div className="flex justify-center mb-6">
      <select
        value={selectedGame}
        onChange={(e) => onChange(e.target.value)}
        className="p-3 border border-gray-300 rounded-xl bg-white shadow-sm"
      >
        <option value="">Select a matchup</option>
        {games.map((game) => (
          <option key={game.id} value={game.id}>
            {game.awayTeam} @ {game.homeTeam}
          </option>
        ))}
      </select>
    </div>
  );
};

export default MatchupSelector;
