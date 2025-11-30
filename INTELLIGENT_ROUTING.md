# Intelligent Question Routing - Kiro-Q Bridge v4.1

## 🎯 Problem Solved

**Before**: When users asked Kiro about AWS/Q-specific topics, they had to:
1. Ask Kiro the question
2. Kiro manually sends to Q
3. User waits
4. User asks "Did Q respond?"
5. Kiro checks and displays response
6. **Result**: Multiple interactions, manual checking, poor UX

**After**: With intelligent routing:
1. User asks Kiro about AWS/Q topics
2. Kiro automatically uses `ask_q` tool
3. Question sent to Q + automatic polling + response retrieved
4. Q's answer displayed immediately
5. **Result**: Single interaction, automatic workflow, seamless UX

## 🚀 New Tool: `ask_q`

### Purpose
Intelligent routing tool that automatically sends questions to Amazon Q and retrieves responses in a single operation.

### How It Works
1. **Send**: Formats and sends question to Q with proper context
2. **Poll**: Automatically checks for Q's response at configurable intervals
3. **Retrieve**: Returns Q's answer when available
4. **Timeout**: Gracefully handles cases where Q doesn't respond immediately

### Parameters
- `question` (required): The question to ask Amazon Q
- `context` (optional): Additional context for better answers
- `priority` (default: 'high'): Message priority level
- `max_wait_seconds` (default: 30): Maximum wait time for response
- `poll_interval_seconds` (default: 2): Time between polling checks

### Example Usage

```javascript
// Simple question
ask_q({
  question: "What is AWS AgentCore?"
})

// Question with context
ask_q({
  question: "How can AgentCore integrate with our Kiro-Q Bridge?",
  context: "We're building an MCP server for IDE-to-Q communication",
  max_wait_seconds: 45
})
```

### Response Format

```
🎯 AMAZON Q RESPONSE (received in 4.2s after 2 polls)

[Q's comprehensive answer here]

---
📊 Routing Stats:
- Question ID: kiro-v4-1764510141747
- Response ID: amazon-q-v4-1764510145923
- Wait Time: 4.2s
- Poll Attempts: 2
```

## 🎨 Use Cases

### Automatic Routing Triggers
Kiro should automatically use `ask_q` when users ask about:

1. **AWS Services**
   - AgentCore, Bedrock, Lambda, S3, etc.
   - Service capabilities and features
   - Integration patterns

2. **Amazon Q Capabilities**
   - What Q can do
   - Q's knowledge domains
   - Q's AWS integration features

3. **Cloud Architecture**
   - AWS best practices
   - Architecture patterns
   - Service selection guidance

4. **Cost & Performance**
   - AWS pricing questions
   - Cost optimization strategies
   - Performance tuning

5. **Security & Compliance**
   - AWS security best practices
   - Compliance requirements
   - IAM and permissions

## 🔧 Implementation Details

### Polling Mechanism
- Uses synchronous polling (busy-wait) suitable for MCP server context
- Configurable poll interval (default: 2 seconds)
- Configurable max wait time (default: 30 seconds)
- Checks message file for Q's response after each interval

### Message Matching
Finds Q's response by:
1. From: "Amazon Q"
2. To: "Kiro"
3. Timestamp after question
4. Reply-to matches question ID OR within 60 seconds of question

### Timeout Handling
If Q doesn't respond within max_wait_seconds:
- Returns timeout message
- Confirms question was sent and queued
- Provides instructions for checking later
- Q can still respond - message remains queued

## 📊 Benefits

### For Users
- ✅ Single interaction to get Q's expertise
- ✅ No manual checking required
- ✅ Immediate feedback when Q responds
- ✅ Clear timeout handling

### For Kiro
- ✅ Proactive intelligence routing
- ✅ Seamless Q integration
- ✅ Better user experience
- ✅ Reduced interaction overhead

### For the Bridge
- ✅ Demonstrates true AI-to-AI collaboration
- ✅ Eliminates manual workflow steps
- ✅ Showcases bridge capabilities
- ✅ Production-ready automation

## 🎯 Next Steps

1. **Test the Tool**: Verify polling and response retrieval work correctly
2. **Update Kiro Logic**: Add automatic detection of Q-specific questions
3. **Monitor Performance**: Track response times and success rates
4. **Optimize Polling**: Adjust intervals based on real-world usage
5. **Add Analytics**: Track which questions get routed to Q

## 📝 Version History

- **v4.1.0** (2025-11-30): Added `ask_q` tool with intelligent routing and auto-polling
- **v4.0.0** (2025-10-21): Initial bidirectional communication bridge
