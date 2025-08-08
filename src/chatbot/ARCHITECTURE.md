# Chatbot System Architecture

## Cấu trúc thư mục hiện tại

```
src/chatbot/
├── services/           # Business Logic Layer
│   ├── chatbotService.js    # Core chat functionality với first-message logic
│   ├── historyService.js    # Chat history management với database
│   └── trainingService.js   # Training và analytics với pattern generation
│
├── core/              # Core Processing Components
│   ├── smartClassifier.js  # Intent classification (bỏ greeting detection)
│   ├── agentRouter.js      # Agent routing logic với fallback imports
│   └── intentTrainer.js    # Training functionality
│
├── utils/             # Utility Functions
│   ├── openai.js          # OpenAI API interface
│   └── agentSelector.js   # Agent selection logic với keyword matching
│
├── agents/            # Agent Definitions
│   ├── index.js           # Exports fallback agents
│   ├── userSupport/       # Specialized user support agents
│   │   ├── accountAgent.js
│   │   ├── postManagementAgent.js
│   │   └── socialAgent.js
│   ├── technical/         # Technical support agents
│   │   ├── troubleshootingAgent.js
│   │   └── performanceAgent.js
│   ├── content/          # Content-related agents
│   │   ├── writingTipsAgent.js
│   │   └── analyticsAgent.js
│   ├── seo/              # SEO-specialized agents
│   │   ├── keywordAgent.js
│   │   ├── technicalSeoAgent.js
│   │   └── contentSeoAgent.js
│   └── fallback/         # General fallback agents
│       ├── defaultAgent.js
│       ├── blogWritingAgent.js
│       ├── contentAnalysisAgent.js
│       ├── seoAgent.js
│       ├── technicalAgent.js
│       └── userSupportAgent.js
│
└── test/              # Test Files (temporary)
    └── debug_*.js
```

## Luồng hoạt động mới

### 1. First Message Logic

```javascript
// Tin nhắn đầu tiên luôn sử dụng defaultAgent
if (isFirstMessage) {
  classificationResult = {
    agentName: "defaultAgent",
    confidence: 1.0,
    method: "first_message_greeting",
    reasoning: "First message in conversation - greeting user",
    cost: 0,
  };
}
```

### 2. Classification Flow

```
Message → Check History → First Message?
├── YES: defaultAgent (greeting)
└── NO: Classification Pipeline
    ├── Pattern Matching (intentTrainer)
    ├── Keyword Matching (agentSelector)
    └── LLM Classification (smartClassifier)
```

### 3. Agent Organization

- **Specialized Agents**: Agents với expertise cụ thể (userSupport/, technical/, content/, seo/)
- **Fallback Agents**: Agents tổng quát trong fallback/ folder
- **Priority System**: Specialized agents được ưu tiên trong agentSelector

### 4. Database Integration

- **Chat History**: Lưu trong `chat_history` với JSON messageContent
- **Training Data**: Auto-generate từ interactions với confidence >= 0.8
- **Pattern Generation**: Tạo patterns khi có >= 10 training examples
- **No First Message Training**: Bỏ qua auto-train cho tin nhắn đầu tiên

## Ưu điểm của cấu trúc hiện tại

1. **First Message Handling**: Tin nhắn đầu tiên luôn thân thiện với defaultAgent
2. **Organized Agent Structure**: Agents được phân loại theo chuyên môn
3. **Database-Driven History**: Lịch sử chat được lưu persistent trong MySQL
4. **Smart Training**: Tự động training từ interactions thành công
5. **Cost Optimization**: Bỏ greeting detection, giảm OpenAI calls không cần thiết
6. **Clean Classification**: Pattern → Keyword → LLM cascade
7. **Fallback Safety**: Luôn có defaultAgent cho edge cases

## API Usage hiện tại

```javascript
// Direct service usage
const chatbotService = require("./services/chatbotService");

// Main chat với first-message logic
const response = await chatbotService.send("Hello", "session123", {
  userId: 1,
  includeContext: true,
  autoTrain: true,
});

// History từ database
const historyService = require("./services/historyService");
const history = await historyService.getRecentHistory("session123", 5);
await historyService.clearHistory("session123");

// Training và analytics
const trainingService = require("./services/trainingService");
await trainingService.trainFromFeedback("Hello", "defaultAgent", "session123");
const stats = await trainingService.getTrainingStats();
```

## Database Schema

```sql
-- Chat history với OpenAI-compatible format
CREATE TABLE chat_history (
  id INT PRIMARY KEY AUTO_INCREMENT,
  sessionId VARCHAR(255),
  userId INT,
  messageContent JSON,  -- {role: "user|assistant", content: "..."}
  messageType ENUM('user', 'assistant'),
  agentName VARCHAR(100),
  metadata JSON,
  createdAt TIMESTAMP
);

-- Training examples từ successful interactions
CREATE TABLE chatbot_training_examples (
  id INT PRIMARY KEY AUTO_INCREMENT,
  intentId INT,
  text TEXT,
  confidence DECIMAL(3,2),
  source VARCHAR(50),
  isActive BOOLEAN
);

-- Auto-generated patterns từ training data
CREATE TABLE chatbot_patterns (
  id INT PRIMARY KEY AUTO_INCREMENT,
  intentId INT,
  keyword VARCHAR(255),
  score DECIMAL(5,4),
  frequency INT,
  isActive BOOLEAN
);
```
