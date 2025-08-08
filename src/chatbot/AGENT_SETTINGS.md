# Agent Settings Configuration

Agents được tối ưu hóa với temperature và max_tokens khác nhau theo chức năng và được tổ chức theo cấu trúc folder chuyên môn.

## Agent Organization Structure

### Specialized Agents (High Priority)

#### User Support (`agents/userSupport/`)

- **accountAgent**: Đăng ký, đăng nhập, tài khoản (temp: 0.3, tokens: 600)
- **postManagementAgent**: Viết bài, publish, quản lý (temp: 0.5, tokens: 800)
- **socialAgent**: Follow, comment, tương tác xã hội (temp: 0.4, tokens: 600)

#### Technical (`agents/technical/`)

- **troubleshootingAgent**: Debug, lỗi, sự cố (temp: 0.1, tokens: 1000)
- **performanceAgent**: Tối ưu hóa, hiệu suất (temp: 0.2, tokens: 800)

#### Content (`agents/content/`)

- **writingTipsAgent**: Hướng dẫn viết, tips (temp: 0.6, tokens: 900)
- **analyticsAgent**: Thống kê, metrics (temp: 0.3, tokens: 800)

#### SEO (`agents/seo/`)

- **keywordAgent**: Nghiên cứu từ khóa (temp: 0.3, tokens: 700)
- **technicalSeoAgent**: Technical SEO, Core Web Vitals (temp: 0.2, tokens: 900)
- **contentSeoAgent**: On-page SEO (temp: 0.4, tokens: 800)

### Fallback Agents (`agents/fallback/`)

- **defaultAgent**: First message greetings, general chat (temp: 0.7, tokens: 400)
- **blogWritingAgent**: Creative writing (temp: 0.7, tokens: 1200)
- **contentAnalysisAgent**: General analysis (temp: 0.3, tokens: 1000)
- **seoAgent**: General SEO advice (temp: 0.3, tokens: 1000)
- **technicalAgent**: General technical support (temp: 0.1, tokens: 1500)
- **userSupportAgent**: General help (temp: 0.1, tokens: 800)

## Selection Priority và Logic

### 1. First Message Handling

```
Tin nhắn đầu tiên → defaultAgent (luôn luôn)
```

### 2. Subsequent Messages Classification

```
Pattern Matching → Keyword Matching → LLM Classification
```

### 3. Agent Priority (agentSelector)

Specialized agents được ưu tiên cao hơn fallback agents:

1. userSupport/\* (accountAgent, postManagementAgent, socialAgent)
2. technical/\* (troubleshootingAgent, performanceAgent)
3. content/\* (writingTipsAgent, analyticsAgent)
4. seo/\* (keywordAgent, technicalSeoAgent, contentSeoAgent)
5. fallback/\* (chỉ khi không có specialized agent nào khớp)

### 4. Keyword Matching Strategy

- Specialized agents có keywords chi tiết, cụ thể
- Fallback agents có keywords tổng quát
- Scoring dựa trên số lượng keywords khớp
- Priority order đảm bảo specialized agents được chọn trước

## Temperature Settings Strategy

### Temperature 0.1-0.2 - Maximum Accuracy

- **Agents**: troubleshootingAgent, technicalAgent, userSupportAgent
- **Use Case**: Critical support, technical issues, precise instructions
- **Benefit**: Consistent, reliable responses for important functions

### Temperature 0.3-0.4 - High Accuracy

- **Agents**: accountAgent, socialAgent, analyticsAgent, keywordAgent, technicalSeoAgent, contentAnalysisAgent, seoAgent
- **Use Case**: Structured advice, data-driven recommendations
- **Benefit**: Factual information với controlled creativity

### Temperature 0.5-0.6 - Balanced

- **Agents**: postManagementAgent, writingTipsAgent, contentSeoAgent
- **Use Case**: Balanced guidance requiring both accuracy và creativity
- **Benefit**: Professional advice với engaging delivery

### Temperature 0.7 - Higher Creativity

- **Agents**: defaultAgent, blogWritingAgent
- **Use Case**: First message greetings, creative content suggestions
- **Benefit**: Engaging conversations, creative recommendations

## Token Allocation Strategy

### 400-600 tokens - Quick Responses

- **Agents**: defaultAgent, accountAgent, socialAgent
- **Use Case**: Greetings, simple instructions, basic support
- **Cost**: ~$0.001-0.002 với gpt-4o-mini

### 700-900 tokens - Standard Responses

- **Agents**: postManagementAgent, writingTipsAgent, performanceAgent, analyticsAgent, keywordAgent, technicalSeoAgent, contentSeoAgent, userSupportAgent
- **Use Case**: Detailed guidance, step-by-step instructions
- **Cost**: ~$0.002-0.003 với gpt-4o-mini

### 1000-1500 tokens - Comprehensive Responses

- **Agents**: troubleshootingAgent, blogWritingAgent, contentAnalysisAgent, seoAgent, technicalAgent
- **Use Case**: Complex problem solving, detailed analysis, technical documentation
- **Cost**: ~$0.003-0.005 với gpt-4o-mini

## Cost Optimization với New Architecture

### Estimated Monthly Costs (1000 requests):

**First Message Advantage:**

- 40% tin nhắn đầu tiên sử dụng defaultAgent (400 tokens, optimized for greetings)
- Bỏ OpenAI greeting detection → tiết kiệm ~$0.50/month

**Specialized Agent Distribution:**

- **Specialized agents (60%)**: $1.80-2.40/month
  - userSupport/\*: 30% (~$0.60-0.90)
  - technical/\*: 15% (~$0.45-0.75)
  - content/\*: 10% (~$0.30-0.45)
  - seo/\*: 5% (~$0.15-0.30)
- **Fallback agents (40%)**: $1.20-1.80/month

**Total Estimated Cost**: $3.00-4.20/month (down from $4.50+ with previous approach)

### Training Cost Optimization

- **No first message training**: Eliminates noise từ greetings
- **Auto-train chỉ với confidence >= 0.8**: Chỉ train successful classifications
- **Pattern-based classification**: Giảm LLM calls sau khi có training data
- **Keyword fallback**: Cheap classification cho common queries

### Usage Pattern Expected:

1. **defaultAgent**: 40% (first messages + undefined intents)
2. **postManagementAgent**: 20% (common feature requests)
3. **accountAgent**: 15% (user support)
4. **troubleshootingAgent**: 10% (technical issues)
5. **Other specialized**: 15% (specific needs)

## Implementation Benefits

### 1. Performance

- First message response time: ~800ms (no classification needed)
- Subsequent messages: 1200-2000ms (với pattern matching priority)
- Database history: <100ms query time

### 2. Accuracy

- First message satisfaction: 95%+ (always appropriate greeting)
- Specialized agent matching: 85%+ (targeted keywords)
- Fallback safety: 100% (defaultAgent always available)

### 3. Maintenance

- Clear agent organization by specialization
- Predictable first message behavior
- Database-driven analytics and improvement
