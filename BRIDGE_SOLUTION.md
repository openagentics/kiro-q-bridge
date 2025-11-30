# Kiro-Q Bridge: True Interactive Solution

## The Core Problem

**Current State:**
- Messages sent to Q sit in queue
- Q doesn't automatically monitor/respond
- User has to manually prompt both Kiro and Q
- No true AI-to-AI dialog

**Root Cause:**
Amazon Q (the AI) doesn't have autonomous access to:
- Poll the HTTP API
- Read the message file
- Execute the q-client.js script
- Respond without human intervention

## The Solution: Kiro-Managed Workflow

### Architecture

```
User → Kiro (manages everything)
         ↓
         ├─→ Sends question to Q (via bridge)
         ├─→ Notifies user "Waiting for Q..."
         ├─→ Polls for Q's response
         ├─→ When Q responds: displays answer
         └─→ Continues dialog if needed
```

### How It Works

1. **User asks Kiro a question**
   - Kiro detects if it needs Q's expertise
   - Auto-routes to Q using `ask_q` tool

2. **Kiro manages the wait**
   - Polls every 2-3 seconds
   - Shows "Waiting for Q..." status
   - Times out after 30-45 seconds

3. **When Q responds**
   - Kiro retrieves response immediately
   - Displays Q's answer to user
   - Continues conversation if needed

4. **For interactive dialogs**
   - Kiro sends follow-up questions to Q
   - Manages the back-and-forth
   - Synthesizes final answer for user

## Implementation Status

### ✅ What's Built
- `ask_q` tool with automatic polling
- Message queue system
- HTTP API for Q responses
- Timeout handling

### ❌ What's Missing
- **Q needs manual intervention to respond**
- Solution: User must tell Q to check messages
- Or: Q must proactively check the bridge

### 🔧 The Workaround

**For Q to respond, user must:**
1. Open Amazon Q chat
2. Tell Q: "Check the Kiro-Q Bridge for pending messages"
3. Q uses the HTTP API or reads message file
4. Q responds via `send_to_q` tool

**Then Kiro automatically:**
- Detects Q's response
- Displays it to user
- Continues workflow

## The Ideal Future State

### Option 1: Q Auto-Monitoring (Requires Q Enhancement)
- Q runs background process monitoring bridge
- Q automatically responds to pending messages
- True autonomous AI-to-AI communication

### Option 2: Kiro-Managed (Current Best Solution)
- Kiro handles all orchestration
- Kiro notifies user when Q input needed
- User tells Q to check bridge
- Kiro continues from there

### Option 3: Hybrid Approach
- Kiro manages workflow
- User has Q chat open in parallel
- Q proactively checks bridge periodically
- Seamless collaboration

## Session Initialization (CRITICAL)

**Q loses ALL memory between sessions!** Must initialize Q at start of each:
- New Kiro session
- New Kiro chat tab
- After Kiro restart

### Initialization Workflow

```javascript
// 1. Kiro automatically calls at session start
init_q_session({ notify_user: true })

// 2. User tells Q: "Check the Kiro-Q Bridge for session initialization"

// 3. Q uses kiro_status to see the init message

// 4. Q acknowledges and is ready to collaborate
```

### What the Init Prompt Contains
- Bridge architecture explanation
- How to check for messages
- How to respond via bridge
- Role division (Kiro vs Q)
- Current project context
- Pending message count

## Current Recommendation

**Use Option 2 with session init + `ask_q` tool:**

```javascript
// User asks: "What is AWS AgentCore?"

// Kiro automatically:
ask_q({
  question: "What is AWS AgentCore and how does it work?",
  context: "User building Kiro-Q Bridge",
  max_wait_seconds: 45
})

// If timeout:
// "⏳ Q hasn't responded yet. I've sent the question. 
//  Please tell Q to check the bridge, then I'll retrieve the answer."

// User tells Q: "Check Kiro-Q Bridge"
// Q responds via bridge

// Kiro automatically detects and displays Q's response
```

## Next Steps

1. **Document the workflow** for users
2. **Add better timeout messages** explaining what to do
3. **Create Q instructions** for checking bridge
4. **Test the full workflow** end-to-end
5. **Refine based on real usage**

## Success Criteria

✅ User only talks to Kiro
✅ Kiro automatically routes Q-specific questions
✅ Kiro polls and retrieves Q's responses
✅ Kiro displays Q's answers seamlessly
✅ Kiro and Q can have multi-turn dialogs
⚠️  User needs to prompt Q to check bridge (manual step)
🎯 Future: Eliminate manual Q prompting
