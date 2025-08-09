# Redis Session Management for Chatbot

## Overview

Chuyển đổi từ manual sessionId management sang Redis-based session management để cải thiện UX và bảo mật.

## Ưu điểm của Redis Session

### 1. **Automatic Session Management**

- Client không cần quản lý sessionId
- Auto-generation với unique IDs
- Session persistence across browser refreshes

### 2. **Security Improvements**

- SessionId không expose trong request body
- TTL tự động expire sessions
- Session validation và cleanup

### 3. **Performance Benefits**

- Fast Redis lookups
- Session caching
- Reduced database queries for session info

### 4. **User Experience**

- Seamless conversation continuation
- Session history tracking
- Multi-device session support

## API Changes

### Before (Manual Session)

```javascript
// Client phải quản lý sessionId
POST /api/chatbot
{
  "message": "Hello",
  "sessionId": "user_123_1645678900_abc123", // Client managed
  "options": {}
}
```

### After (Redis Session)

```javascript
// Tự động session management
POST /api/chatbot
Headers: {
  "X-Session-Id": "optional_existing_session" // Optional
}
Body: {
  "message": "Hello",
  "options": {}
}

Response: {
  "data": {
    "response": "Chào bạn!...",
    "sessionId": "user_123_1645678900_abc123", // Server managed
    "metadata": {...}
  }
}
```

## Session Lifecycle

### 1. **Session Creation**

```
Client Request → SessionManager.getOrCreateSession() → Redis Session Store
```

### 2. **Session Continuation**

```
X-Session-Id Header → Validate in Redis → Extend TTL → Continue Conversation
```

### 3. **Session Expiry**

```
24h TTL → Auto-cleanup → New Session on Next Request
```

## Redis Data Structure

### Session Data

```
Key: "chat_session:user_123_1645678900_abc123"
Value: {
  "userId": 123,
  "createdAt": "2025-01-08T10:00:00Z",
  "lastActivity": "2025-01-08T10:15:00Z",
  "messageCount": 5
}
TTL: 86400 seconds (24 hours)
```

### User Sessions Tracking

```
Key: "user_sessions:123"
Value: [
  {
    "sessionId": "user_123_1645678900_abc123",
    "createdAt": "2025-01-08T10:00:00Z"
  },
  // ... last 10 sessions
]
TTL: 604800 seconds (7 days)
```

## New Endpoints

### Session Management

```
POST /api/chatbot/session              # Create new session
GET /api/chatbot/sessions              # Get user's sessions
DELETE /api/chatbot/session/:id        # Clear specific session
DELETE /api/chatbot/sessions           # Clear all user sessions
GET /api/chatbot/session/:id/stats     # Get session statistics
```

## Client Integration

### Frontend Example

```javascript
class ChatService {
  constructor() {
    this.sessionId = localStorage.getItem("chat_session_id");
  }

  async sendMessage(message) {
    const headers = {};
    if (this.sessionId) {
      headers["X-Session-Id"] = this.sessionId;
    }

    const response = await fetch("/api/chatbot", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({ message }),
    });

    const data = await response.json();

    // Store returned sessionId for future requests
    this.sessionId = data.data.sessionId;
    localStorage.setItem("chat_session_id", this.sessionId);

    return data.data;
  }

  async clearSession() {
    if (this.sessionId) {
      await fetch(`/api/chatbot/session/${this.sessionId}`, {
        method: "DELETE",
      });
      localStorage.removeItem("chat_session_id");
      this.sessionId = null;
    }
  }
}
```

## Benefits for User Experience

### 1. **Seamless Conversations**

- Users don't lose context on page refresh
- Sessions persist across browser tabs
- Automatic session restoration

### 2. **Better Session Management**

- View conversation history
- Manage multiple conversations
- Clear old conversations

### 3. **Performance**

- Faster session lookups
- Reduced payload size
- Optimized memory usage

## Redis Fallback

Nếu Redis không available:

- System fallback to simple UUID generation
- No session persistence
- Basic functionality still works
- Graceful degradation

## Monitoring

### Session Metrics

```javascript
// Available through new endpoints
{
  "activeSessions": 1234,
  "averageSessionDuration": "15 minutes",
  "messagesPerSession": 8.5,
  "sessionConversionRate": "85%"
}
```

### Redis Health

```javascript
// Health check endpoint
GET /api/chatbot/health
{
  "redis": {
    "healthy": true,
    "latency": "2ms",
    "memory": "45MB"
  },
  "sessions": {
    "active": 1234,
    "total": 5678
  }
}
```

Việc sử dụng Redis session management sẽ cải thiện đáng kể UX và performance của chatbot system!
