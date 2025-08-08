# Chatbot System Architecture

## Cấu trúc thư mục mới

```
src/chatbot/
├── services/           # Business Logic Layer
│   ├── index.js       # Entry point - exports manager
│   ├── manager.js     # ChatbotManager - Pure delegation layer
│   ├── chatbotService.js    # Core chat functionality
│   ├── historyService.js    # Chat history management
│   └── trainingService.js   # Training and analytics
│
├── core/              # Core Processing Components
│   ├── smartClassifier.js  # Intent classification
│   ├── agentRouter.js      # Agent routing logic
│   └── intentTrainer.js    # Training functionality
│
├── utils/             # Utility Functions
│   ├── openai.js          # OpenAI API interface
│   ├── agentSelector.js   # Agent selection logic
│   └── intentClassifier.js # Basic classification
│
├── agents/            # Agent Definitions
│   ├── index.js
│   ├── defaultAgent.js
│   ├── blogWritingAgent.js
│   └── ...
│
└── test/              # Test Files
    ├── classificationTest.js
    └── databaseTest.js
```

## Luồng hoạt động

### 1. Controller Layer

```javascript
const chatbotManager = require("@/chatbot/services");

// All operations go through the manager
await chatbotManager.send(message, sessionId, options);
await chatbotManager.getConversationHistory(sessionId);
await chatbotManager.trainFromFeedback(message, agent, sessionId);
```

### 2. Service Layer (ChatbotManager)

- **chatbotService**: Xử lý tin nhắn chính
- **historyService**: Quản lý lịch sử chat
- **trainingService**: Xử lý training và analytics

### 3. Core Layer

- **smartClassifier**: Phân loại intent thông minh
- **agentRouter**: Routing đến agent phù hợp
- **intentTrainer**: Training từ feedback

### 4. Utils Layer

- **openai**: Interface với OpenAI API
- **agentSelector**: Logic chọn agent
- **intentClassifier**: Classification cơ bản

## Ưu điểm của cấu trúc mới

1. **Tách biệt rõ ràng**: Mỗi layer có trách nhiệm riêng
2. **Single entry point**: Tất cả operations qua ChatbotManager
3. **Dễ maintain**: Logic tập trung, ít phụ thuộc
4. **Scalable**: Dễ mở rộng và thêm tính năng mới
5. **Testable**: Mỗi component có thể test riêng

## API Usage

```javascript
// Main chat
const response = await chatbotManager.send("Hello", "session123", {
  userId: 1,
  includeContext: true,
  autoTrain: true,
});

// History management
const history = await chatbotManager.getConversationHistory("session123");
await chatbotManager.clearConversationHistory("session123");

// Training
await chatbotManager.trainFromFeedback("Hello", "defaultAgent", "session123");
await chatbotManager.addTrainingExample("Hi", "defaultAgent", 1.0, "manual");

// Analytics
const stats = await chatbotManager.getStats();
const classificationStats = await chatbotManager.getClassificationStats(7);
```
