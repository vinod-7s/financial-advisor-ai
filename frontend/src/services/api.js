import axios from "axios";

const API = "http://127.0.0.1:8000";

export const getStock = (symbol) =>
  axios.get(`${API}/stock/${symbol}`);

export const getChart = (symbol) =>
  axios.get(`${API}/chart/${symbol}`);

export const compareStocks = (s1, s2) =>
  axios.get(`${API}/compare/${s1}/${s2}`);

export const getNews = () =>
  axios.get(`${API}/news`);
export const getHistory = () =>
  axios.get(`${API}/history`);

export const clearHistory = () =>
  axios.delete(`${API}/history`);