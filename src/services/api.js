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

/**
 * Cập nhật tổng chi tiêu của khách hàng
 * @param {string} customerId - Mã khách hàng
 * @returns {Promise} - Thông tin khách hàng sau khi cập nhật
 */
export const updateCustomerSpending = async (customerId) => {
  try {
    const response = await api.put(`/api/customers/${customerId}/update-spending`);
    return response.data;
  } catch (error) {
    console.error('Error updating customer spending:', error);
    throw error;
  }
};

/**
 * Lấy tổng hợp đánh giá của phim
 * @param {string} movieId - Mã phim
 * @param {number} minReviewCount - Số lượng đánh giá tối thiểu (optional)
 * @returns {Promise} - Thông tin đánh giá phim
 */
export const getMovieRatingSummary = async (movieId, minReviewCount = 1) => {
  try {
    const response = await api.get(`/api/movie-ratings/${movieId}`, {
      params: {
        minReviewCount
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie rating summary:', error);
    throw error;
  }
};
