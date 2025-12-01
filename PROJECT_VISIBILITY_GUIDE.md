# Project Visibility Guide: What Shows Where

## Quick Answer

**The bridge is now GLOBAL** - it works in ALL your Kiro projects without keeping the bridge project open!

## Configuration Hierarchy

```
User-Level Config (GLOBAL)
~/.kiro/settings/mcp.json
    ↓
    Works in ALL projects
    ↓
    ├─→ Project A
    ├─→ Project B  
    ├─→ Project C
    └─→ Any other project

Workspace-Level Config (PROJECT-SPECIFIC)
.kiro/settings/mcp.json
    ↓
    Only works in THIS project
    ↓
    Overrides user-level config
```

## Your Current Setup

### User-Level (Global) ✅
**Location:** `~/.kiro/settings/mcp.json`

**What's configured:**
- `kiro-q-bridge-v4` - Full bridge with all 6 tools
- `aws-docs` - AWS documentation MCP server

**Available in:** ALL Kiro projects

**Tools available everywhere:**
- `kiro_status`
- `send_to_q`
- `ask_q`
- `init_q_session`
- `get_related_messages` 🆕
- `list_projects` 🆕

### Workspace-Level (This Project Only)
**Location:** `.kiro/settings/mcp.json` (in kiro-q-bridge-v4 project)

**What's configured:**
- `kiro-q-bridge-v4-enhanced` - Points to older bridge-server-enhanced.js

**Status:** Can be removed (redundant with global config)

## What You See in Each Project

### In ANY Kiro Project (e.g., my-web-app, data-pipeline, etc.)

**MCP Tools Available:**
```javascript
// Bridge tools (from global config)
kiro_status()
send_to_q({ message: "..." })
ask_q({ question: "..." })
init_q_session()
get_related_messages({ related_topics: ["AWS"] })
list_projects()

// AWS docs tools (from global config)
search_documentation({ search_phrase: "..." })
read_documentation({ url: "..." })
```

**Message Access:**
- All messages from ALL projects via `~/.kiro/q-messages.json`
- Can filter to see only current project's messages
- Can search across all projects

**Example in "my-web-app" project:**
```javascript
// See all projects
list_projects()
// Output shows: kiro-q-bridge-v4, my-web-app, data-pipeline, etc.

// See only my-web-app messages
kiro_status({ filter_project: "my-web-app" })

// Find related messages from other projects
get_related_messages({
  related_topics: ["authentication", "API"],
  exclude_current_project: true
})
```

### In the kiro-q-bridge-v4 Project

**Same as above, PLUS:**
- Source code for the bridge
- Utility scripts (`view-messages.sh`, `link-messages.sh`)
- Documentation files
- Test scripts

**But the bridge itself works the same way** - it's just another project using the global MCP server.

## Message File Visibility

### Global Message File
**Location:** `~/.kiro/q-messages.json`

**Contains:** ALL messages from ALL projects

**Accessible from:** Every Kiro project (via MCP tools)

**Structure:**
```json
[
  {
    "project": "kiro-q-bridge-v4",
    "message": "...",
    "from": "Kiro",
    "to": "Amazon Q"
  },
  {
    "project": "my-web-app",
    "message": "...",
    "from": "Amazon Q",
    "to": "Kiro"
  },
  {
    "project": "data-pipeline",
    "message": "...",
    "from": "Kiro",
    "to": "Amazon Q"
  }
]
```

### Workspace Message Files (Optional)
**Location:** `.kiro-q-messages.json` (in each project)

**Purpose:** Optional symlink to global file for direct file access

**Create with:** `./link-messages.sh` (run in any project)

**Benefit:** Can open the message file directly in that project's editor

## Practical Examples

### Scenario 1: Working on "my-web-app"

**What you can do:**
```javascript
// Send message to Q (tagged with "my-web-app")
send_to_q({
  message: "How should I implement JWT authentication?",
  priority: "high"
})

// See only my-web-app messages
kiro_status({ filter_project: "my-web-app" })

// Find auth-related messages from other projects
get_related_messages({
  related_topics: ["authentication", "JWT", "security"]
})
// Might find: "In data-pipeline project, Q recommended AWS Cognito..."
```

### Scenario 2: Working on "data-pipeline"

**What you can do:**
```javascript
// Send message (tagged with "data-pipeline")
send_to_q({
  message: "What's the best way to process S3 events with Lambda?",
  priority: "high"
})

// See all projects
list_projects()
// Shows: kiro-q-bridge-v4, my-web-app, data-pipeline

// Find Lambda advice from other projects
get_related_messages({
  related_topics: ["Lambda", "S3", "AWS"]
})
// Might find: "In my-web-app, Q suggested Lambda proxy integration..."
```

### Scenario 3: Starting a New Project

**What you can do:**
```javascript
// Initialize Q session for new project
init_q_session()

// See what Q has said about similar topics in other projects
get_related_messages({
  related_topics: ["React", "API", "deployment"]
})

// Ask Q with context from other projects
send_to_q({
  message: "I'm starting a new React app. Based on our previous discussions in my-web-app and data-pipeline, what architecture would you recommend?",
  priority: "high"
})
```

## Do You Need to Keep kiro-q-bridge-v4 Open?

### ❌ NO - You Don't Need to Keep It Open

**Why:**
- The MCP server is configured at **user level** (`~/.kiro/settings/mcp.json`)
- Kiro loads MCP servers from user config on startup
- The server runs independently of which project is open
- The server executable is at a fixed path: `/Users/paul-m4-macair/Documents/kiro-q-bridge-v4/mcp-server.js`

**What happens:**
1. You open ANY Kiro project
2. Kiro reads `~/.kiro/settings/mcp.json`
3. Kiro starts the bridge MCP server
4. Bridge tools are available in that project
5. Messages are tagged with that project's name

### ✅ When You Might Open kiro-q-bridge-v4

**Only when you want to:**
- Update the bridge code
- Run utility scripts (`./view-messages.sh`)
- Read documentation
- Run tests
- Modify configuration

**For daily use:** Just work in your actual projects!

## Visual Summary

```
┌─────────────────────────────────────────────────────────┐
│  Kiro IDE (Any Project Open)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MCP Servers (from ~/.kiro/settings/mcp.json):         │
│  ├─ kiro-q-bridge-v4 ✅ (6 tools)                      │
│  └─ aws-docs ✅ (3 tools)                              │
│                                                         │
│  Current Project: my-web-app                            │
│  ├─ Can use all bridge tools                           │
│  ├─ Messages tagged with "my-web-app"                  │
│  ├─ Can see messages from other projects               │
│  └─ Can search across all projects                     │
│                                                         │
│  Message Storage: ~/.kiro/q-messages.json               │
│  ├─ kiro-q-bridge-v4: 40 messages                      │
│  ├─ my-web-app: 38 messages                            │
│  ├─ data-pipeline: 32 messages                         │
│  └─ mobile-app: 12 messages                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## Testing in Other Projects

### Step 1: Open a Different Project
```bash
cd ~/projects/my-other-project
code .  # or open in Kiro
```

### Step 2: Try Bridge Tools
```javascript
// Should work immediately!
list_projects()
kiro_status()
send_to_q({ message: "Testing from my-other-project" })
```

### Step 3: Verify Project Tagging
```javascript
// Send a message
send_to_q({ message: "Test from my-other-project" })

// Check it was tagged correctly
list_projects()
// Should now show "my-other-project" in the list
```

## Troubleshooting

### Bridge Not Available in Other Projects?

**Check user-level config:**
```bash
cat ~/.kiro/settings/mcp.json
```

**Should see:**
```json
{
  "mcpServers": {
    "kiro-q-bridge-v4": {
      "command": "node",
      "args": ["/Users/paul-m4-macair/Documents/kiro-q-bridge-v4/mcp-server.js"]
    }
  }
}
```

**Fix:** Restart Kiro IDE to reload MCP configuration

### Messages Not Showing from Other Projects?

**Check message file:**
```bash
cat ~/.kiro/q-messages.json | jq '.[].project' | sort -u
```

**Should see all your project names**

### Want to Remove Workspace-Level Config?

**In kiro-q-bridge-v4 project:**
```bash
rm .kiro/settings/mcp.json
```

**Why:** It's redundant with the global config and might cause confusion

## Best Practices

1. **Use Global Config** - Keep bridge in `~/.kiro/settings/mcp.json`
2. **Don't Keep Bridge Open** - Work in your actual projects
3. **Tag Messages Naturally** - Project name is auto-detected
4. **Search Across Projects** - Use `get_related_messages()` regularly
5. **Review Periodically** - Use `list_projects()` to see all activity

## Summary

✅ **Bridge is GLOBAL** - Works in all projects  
✅ **No need to keep bridge project open** - MCP server runs independently  
✅ **All messages accessible everywhere** - Via `~/.kiro/q-messages.json`  
✅ **Project-specific tagging** - Automatic based on current project  
✅ **Cross-project search** - Find related messages from any project  
✅ **Same tools everywhere** - Consistent experience across all projects  

**You can now close the kiro-q-bridge-v4 project and use the bridge from any other project!** 🎉
