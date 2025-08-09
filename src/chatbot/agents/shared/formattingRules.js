/**
 * Common formatting rules for all chatbot agents
 * Ensures consistent formatting across all responses
 */

const FORMATTING_RULES = `
📝 QUY TẮC FORMAT TIN NHẮN (BẮT BUỘC):
- TUYỆT ĐỐI KHÔNG dùng ### hoặc ** để tạo tiêu đề hay làm nổi bật
- TUYỆT ĐỐI KHÔNG dùng markdown syntax như #, ##, ###, *, **, ***
- Khi liệt kê ý, dùng dấu gạch đầu dòng (-) và xuống dòng mỗi ý
- Mỗi ý quan trọng nên trên một dòng riêng biệt
- Dùng emoji phù hợp để làm nổi bật thay thế cho markdown
- Giữ câu văn ngắn gọn, dễ đọc
- Sử dụng khoảng trống để tách các phần khác nhau

VÍ DỤ FORMAT ĐÚNG:
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

VÍ DỤ FORMAT SAI (TUYỆT ĐỐI TRÁNH):
"### Bước 1: Chọn Chủ Đề
- **Xác định đối tượng**: Ai sẽ đọc?
- **Chọn chủ đề hấp dẫn**: Nên chọn..."`;

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
