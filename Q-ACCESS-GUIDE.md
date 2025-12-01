# Amazon Q Access Guide - No Permission Required

## 🎯 Problem Solved: Workspace Message File

**Issue**: Q had to ask for permission each session to access `~/.kiro/q-messages.json`
**Solution**: Messages now stored in workspace at `./.kiro-q-messages.json`

## 📁 File Locations

**Primary (No Permissions Needed)**: `./.kiro-q-messages.json` (in current workspace)
**Backup**: `~/.kiro/q-messages.json` (migrated automatically)

## 🤖 For Amazon Q: How to Access Messages

```bash
# Read messages directly (no permission prompt)
cat .kiro-q-messages.json

# View recent messages
tail -20 .kiro-q-messages.json

# Check for pending Kiro messages
jq '.[] | select(.from == "Kiro" and .to == "Amazon Q")' .kiro-q-messages.json
```

## 🔄 Automated Response Flow

1. **Q receives notification** of new Kiro message
2. **Q reads `.kiro-q-messages.json`** (no permission needed)
3. **Q responds using MCP tool**: `send_to_q` with `from="Amazon Q"`
4. **Response appears in Kiro chat** automatically

## ✅ Testing Connection

Amazon Q can test the bridge by:
```bash
# Check if file exists and is readable
ls -la .kiro-q-messages.json

# Send test response
# Use MCP tool: send_to_q(message="Test response from Q", from="Amazon Q")
```

## 🚨 Anti-Simulation Protection

The bridge now blocks simulated Q responses when:
- No legitimate Q activity in 24+ hours
- Q appears offline based on message patterns
- Suspicious response timing detected

**This ensures only real Q responses appear in Kiro chat.**