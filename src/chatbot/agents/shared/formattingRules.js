/**
 * Common formatting rules for all chatbot agents
 * Ensures consistent formatting across all responses
 */

const FORMATTING_RULES = `
## 🎯 Hướng dẫn format:
- Ưu tiên dùng dấu gạch đầu dòng (-) cho lists
- Hạn chế dùng ### và ** - chỉ khi thực sự cần thiết
- Sử dụng emoji để làm nổi bật
- Giữ câu văn ngắn gọn, dễ đọc
- Sử dụng khoảng trống để tách các phần khác nhau

**Ví dụ format tốt:**
"Chào bạn! 😊 Dưới đây là hướng dẫn viết blog hiệu quả:

Bước 1: Chọn chủ đề
- Xác định đối tượng độc giả
- Chọn chủ đề hấp dẫn và phù hợp

Bước 2: Nghiên cứu
- Tìm hiểu thông tin liên quan
- Ghi chú các điểm quan trọng

Bước 3: Lập dàn ý
- Tạo tiêu đề ngắn gọn
- Chia thành mở bài, thân bài, kết bài

Bạn muốn tìm hiểu thêm về bước nào cụ thể?"

Note: Frontend đã hỗ trợ markdown rendering nên có thể dùng ### và ** khi cần thiết.`;

/**
 * Add formatting rules to any agent prompt
 * @param {string} basePrompt - The base prompt for the agent
 * @returns {string} - Enhanced prompt with formatting rules
 */
function addFormattingRules(basePrompt) {
  return `${basePrompt}

${FORMATTING_RULES}`;
}

module.exports = {
  FORMATTING_RULES,
  addFormattingRules,
};
