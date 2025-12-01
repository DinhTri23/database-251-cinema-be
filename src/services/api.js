import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:6868", // URL gốc backend local
  headers: {
    "Content-Type": "application/json",
  },
});

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
