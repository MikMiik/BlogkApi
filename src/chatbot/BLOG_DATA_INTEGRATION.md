# Blog Data Integration for Chatbot

Hệ thống này cho phép chatbot truy cập và tương tác với dữ liệu thực của blog, bao gồm bài viết, tác giả, danh mục và thẻ.

## 🚀 Tính năng

### BlogDataAgent có thể:

- ✅ Tìm tác giả của bài viết theo tiêu đề
- ✅ Tìm các bài viết của một tác giả cụ thể
- ✅ Hiển thị bài viết mới nhất
- ✅ Tìm kiếm bài viết theo nội dung
- ✅ Lấy thông tin chi tiết về bài viết
- ✅ Tìm bài viết theo danh mục
- ✅ Thống kê blog

### Ví dụ câu hỏi được hỗ trợ:

```
❓ "tác giả của bài viết Conspergo admiratio decor là ai"
❓ "ai viết bài JavaScript Tips"
❓ "bài viết mới nhất"
❓ "5 bài mới nhất"
❓ "bài viết của tác giả John Doe"
❓ "tìm bài về react"
❓ "chi tiết bài viết 'React Hooks Guide'"
❓ "bài viết trong danh mục Technology"
❓ "thống kê blog"
```

## 📁 Cấu trúc file

```
src/chatbot/
├── agents/data/
│   └── blogDataAgent.js          # Agent xử lý query về blog data
├── services/
│   └── blogDataService.js        # Service truy cập database
├── training/
│   └── blogDataTraining.js       # Script training data
└── test/
    └── blogDataTest.js           # Test hệ thống
```

## 🔧 Cài đặt và Sử dụng

### 1. Training BlogDataAgent

Chạy một trong các lệnh sau để train agent:

```bash
# Qua API endpoint
POST /api/chatbot/training/blog-data

# Hoặc trực tiếp chạy script
node src/chatbot/training/blogDataTraining.js
```

### 2. Test hệ thống

```bash
node src/chatbot/test/blogDataTest.js
```

### 3. Sử dụng qua chatbot

Gửi tin nhắn về blog data qua API chatbot:

```bash
POST /api/chatbot
{
  "message": "tác giả của bài viết Conspergo admiratio decor là ai"
}
```

## 🎯 Cách hoạt động

### 1. Phân loại Query

SmartClassifier sẽ phát hiện các query về blog data thông qua:

- Từ khóa: "tác giả", "bài viết", "tiêu đề", etc.
- Pattern: Cấu trúc câu hỏi về author/title
- Context: Nội dung liên quan đến blog

### 2. Xử lý Data

BlogDataAgent sẽ:

- Phân tích loại query (tìm author, tìm post, etc.)
- Truy cập database qua BlogDataService
- Trả về kết quả đã format

### 3. Response

- Nếu tìm thấy: Trả về thông tin chi tiết
- Nếu không tìm thấy: Gợi ý kiểm tra lại hoặc tìm kiếm tương tự
- Luôn format markdown để dễ đọc

## 📊 Performance

### Caching

- BlogDataService có cache 5 phút
- Giảm tải database
- Tăng tốc độ response

### Optimization

- Query database hiệu quả với include/join
- Pagination cho kết quả lớn
- Error handling robust

## 🛠️ API Endpoints

### Training

```
POST /api/chatbot/training/blog-data
```

### Chat với Blog Data

```
POST /api/chatbot
{
  "message": "your blog question",
  "options": {
    "includeContext": true,
    "autoTrain": true
  }
}
```

## 🔍 Debug và Monitoring

### Logs

- Classification method: "blog_data_detection"
- Agent: "blogDataAgent"
- UsedOpenAI: false (nếu xử lý trực tiếp data)

### Classification Stats

```bash
GET /api/chatbot/stats
```

## 🚨 Troubleshooting

### 1. Agent không được gọi

- Kiểm tra training data
- Verify keyword patterns trong smartClassifier
- Check confidence threshold

### 2. Database errors

- Verify database connection
- Check model relationships (Post, User, Category, Tag)
- Ensure proper foreign keys

### 3. Performance issues

- Check cache settings
- Monitor database query performance
- Optimize include relationships

## 🔄 Mở rộng

### Thêm loại query mới:

1. Cập nhật `analyzeQuery()` trong BlogDataAgent
2. Thêm method xử lý tương ứng
3. Update training data
4. Test và retrain

### Thêm data source:

1. Extend BlogDataService
2. Add new methods trong BlogDataAgent
3. Update system prompt trong agentRouter

## 📝 Notes

- Hệ thống ưu tiên xử lý data trực tiếp (không qua OpenAI) để tăng tốc độ và độ chính xác
- Fallback sang OpenAI nếu xử lý data thất bại
- Auto-training giúp cải thiện classification theo thời gian
- Cache giúp tối ưu performance cho các query lặp lại
