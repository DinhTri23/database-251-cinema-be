// api.js
import axios from "axios";

// BASE URL API
const API_URL = "http://localhost:6868/api/movies";

const api = axios.create({
  baseURL: 'http://localhost:6868',
  headers: {
    'Content-Type': 'application/json',
  },
});

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
}
export default api;
/**
 * Lấy báo cáo doanh thu theo chi nhánh
 * @param {string} fromDate - Ngày bắt đầu (YYYY-MM-DD)
 * @param {string} toDate - Ngày kết thúc (YYYY-MM-DD)
 * @param {number} minRevenue - Doanh thu tối thiểu
 * @returns {Promise} - Danh sách báo cáo doanh thu
 */
export const getBranchIncome = async (fromDate, toDate, minRevenue) => {
  try {
    const response = await api.get('/api/reports/branch-income', {
      params: {
        fromDate,
        toDate,
        minRevenue
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching branch income report:', error);
    throw error;
  }
};

/**
 * Lấy thông tin vé theo TicketID
 * @param {string} ticketId - Mã vé
 * @returns {Promise} - Thông tin vé
 */
export const getTicketById = async (ticketId) => {
  try {
    const response = await api.get(`/api/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    throw error;
  }
};
