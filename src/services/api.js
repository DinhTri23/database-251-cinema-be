// api.js
import axios from "axios";

// BASE URL API
const API_URL = "http://localhost:6868/api/movies";

// ============================
// 1) GET LIST MOVIES (search + sort + paging)
// ============================
export const getMovies = async (params = {}) => {
  const res = await axios.get(API_URL, { params });
  return res.data; // { data, total, page, pageSize... }
};

// ============================
// 2) GET MOVIE BY ID
// ============================
export const getMovieById = async (id) => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data;
};

// ============================
// 3) CREATE MOVIE (POST)
// ============================
export const createMovie = async (movie) => {
  const res = await axios.post(API_URL, movie);
  return res.data;
};

// ============================
// 4) UPDATE MOVIE (PUT)
// ============================
export const updateMovie = async (id, movie) => {
  const res = await axios.put(`${API_URL}/${id}`, movie);
  return res.data;
};

// ============================
// 5) PARTIAL UPDATE (PATCH)
// ============================
export const patchMovie = async (id, fields) => {
  const res = await axios.patch(`${API_URL}/${id}`, fields);
  return res.data;
};

// ============================
// 6) DELETE MOVIE
// ============================
export const deleteMovie = async (id) => {
  const res = await axios.delete(`${API_URL}/${id}`);
  return res.data;
};
