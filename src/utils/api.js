import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || "https://statsnap-backend.onrender.com";

export const fetchLiveGames = async () => {
  const { data } = await axios.get(`${BASE}/api/ab/games/today`);
  return data?.data || [];
};

export const fetchUpcomingGames = async () => {
  const { data } = await axios.get(`${BASE}/api/ab/games/upcoming`);
  return data?.data || [];
};

export const fetchOdds = async () => {
  const { data } = await axios.get(`${BASE}/api/ab/odds?bookmaker=FanDuel`);
  return data?.data || [];
};

export const fetchPredictions = async () => {
  const { data } = await axios.get(`${BASE}/api/ab/predictions`);
  return data?.data || [];
};
