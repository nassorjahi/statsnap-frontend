import React from "react";

const SuggestionChips = ({ suggestions }) => (
  <div className="flex flex-wrap justify-center gap-3 mt-4">
    {suggestions.map((text, idx) => (
      <div
        key={idx}
        className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm"
      >
        {text}
      </div>
    ))}
  </div>
);

export default SuggestionChips;
