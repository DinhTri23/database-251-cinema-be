import api from './api';

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
