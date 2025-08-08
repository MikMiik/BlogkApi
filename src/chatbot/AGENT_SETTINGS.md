# Agent Settings Configuration

Mỗi agent được tối ưu hóa với temperature và max_tokens khác nhau để đảm bảo hiệu quả và chi phí tối ưu.

## Temperature Settings Explained

### Temperature 0.1 - Maximum Accuracy

- **Use Case**: Technical troubleshooting, user support instructions
- **Agents**: `technicalAgent`, `userSupportAgent`
- **Benefit**: Consistent, accurate responses cho critical functions
- **Trade-off**: Ít creativity nhưng reliable

### Temperature 0.2-0.3 - High Accuracy

- **Use Case**: SEO recommendations, data analysis
- **Agents**: `seoAgent`, `contentAnalysisAgent`
- **Benefit**: Factual information với minimal creativity
- **Trade-off**: Accurate nhưng still engaging

### Temperature 0.5 - Balanced

- **Use Case**: General guidance, balanced advice
- **Agents**: `defaultAgent`
- **Benefit**: Cân bằng accuracy và creativity
- **Trade-off**: Good for general conversations

### Temperature 0.7 - Higher Creativity

- **Use Case**: Content creation, blog writing advice
- **Agents**: `blogWritingAgent`
- **Benefit**: Creative suggestions, varied responses
- **Trade-off**: More creative but less predictable

## Max Tokens Strategy

### 800 tokens - Concise Responses

- **Use Case**: User support, general guidance
- **Agents**: `defaultAgent`, `userSupportAgent`
- **Benefit**: Quick, focused answers
- **Cost**: ~0.002-0.003 USD per response với gpt-4o-mini

### 1000 tokens - Detailed Analysis

- **Use Case**: SEO advice, content analysis
- **Agents**: `seoAgent`, `contentAnalysisAgent`
- **Benefit**: Comprehensive recommendations
- **Cost**: ~0.003-0.004 USD per response

### 1200 tokens - Creative Content

- **Use Case**: Blog writing guidance, creative advice
- **Agents**: `blogWritingAgent`
- **Benefit**: Detailed creative suggestions
- **Cost**: ~0.004-0.005 USD per response

### 1500 tokens - Technical Solutions

- **Use Case**: Complex troubleshooting, technical documentation
- **Agents**: `technicalAgent`
- **Benefit**: Complete step-by-step solutions
- **Cost**: ~0.005-0.006 USD per response

## Cost Optimization Benefits

### Estimated Monthly Costs (1000 requests):

- **Previous (fixed 800 tokens, 0.7 temp)**: ~$3.50/month
- **New (optimized per agent)**: ~$2.80-4.20/month
- **Average savings**: 15-20% với better quality responses

### Usage Distribution Expected:

- `userSupportAgent`: 40% (cheapest settings)
- `defaultAgent`: 25% (balanced settings)
- `blogWritingAgent`: 20% (creative settings)
- `technicalAgent`: 10% (most expensive but necessary)
- `seoAgent`: 3% (specialized usage)
- `contentAnalysisAgent`: 2% (specialized usage)

## Performance Monitoring

Track these metrics để optimize further:

- Response accuracy per agent
- User satisfaction ratings
- Token usage efficiency
- Cost per successful resolution

## Best Practices

1. **Agent Selection**: Accurate keyword matching critical cho cost efficiency
2. **Prompt Engineering**: Concise system prompts to maximize useful tokens
3. **Response Validation**: Monitor output quality với different settings
4. **User Feedback**: Collect feedback để tune settings over time
