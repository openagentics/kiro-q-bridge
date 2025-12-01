# Kiro-Q Bridge Quick Reference

## MCP Tools (Use in Kiro IDE)

### Basic Communication

```javascript
// Send message to Amazon Q
send_to_q({
  message: "Your question here",
  priority: "high"  // low, normal, high
})

// Get bridge status
kiro_status({
  show_messages: true,
  message_count: 5
})

// Ask Q and wait for response
ask_q({
  question: "What is AWS Lambda?",
  max_wait_seconds: 30
})
```

### Cross-Project Features 🆕

```javascript
// List all projects with messages
list_projects({
  show_details: true
})

// Find related messages across projects
get_related_messages({
  related_topics: ["AWS", "Lambda", "cost"],
  max_messages: 10,
  exclude_current_project: true
})

// View messages from specific project
kiro_status({
  filter_project: "my-other-project",
  message_count: 10
})

// View messages from all projects
kiro_status({
  show_all_projects: true,
  message_count: 20
})
```

## Command-Line Utilities

```bash
# View all messages
./view-messages.sh

# View messages for specific project
./view-messages.sh project-name

# View as JSON
./view-messages.sh all json

# Link global messages to workspace
./link-messages.sh

# Test all features
./test-cross-project.sh
```

## Common Workflows

### Starting a New Session

```javascript
// Initialize Q session
init_q_session({ notify_user: true })

// Check status
kiro_status({ show_messages: true })
```

### Finding Related Work

```javascript
// 1. List all projects
list_projects({ show_details: true })

// 2. Search for related topics
get_related_messages({
  related_topics: ["authentication", "API"],
  max_messages: 15
})

// 3. View specific project details
kiro_status({
  filter_project: "web-app-backend",
  message_count: 10
})
```

### Learning from Past Projects

```javascript
// Find AWS-related discussions
get_related_messages({
  related_topics: ["AWS", "architecture", "cost"],
  max_messages: 20,
  exclude_current_project: false
})

// Ask Q to synthesize
send_to_q({
  message: "Based on our AWS discussions across projects, what are the top cost optimization strategies you've recommended?",
  priority: "high"
})
```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Global Messages | `~/.kiro/q-messages.json` | All messages across projects |
| Workspace Link | `.kiro-q-messages.json` | Symlink to global (optional) |
| MCP Config | `~/.kiro/settings/mcp.json` | Bridge configuration |
| Documentation | `CROSS_PROJECT_GUIDE.md` | Complete guide |

## Tips

✅ **Use descriptive project names** - Makes filtering easier  
✅ **Tag important topics** - Mention key terms in messages  
✅ **Regular reviews** - Check related messages weekly  
✅ **Link active projects** - Run `./link-messages.sh` in frequently used projects  
✅ **Export for docs** - Use `./view-messages.sh project json` to export  

## Troubleshooting

```bash
# Check global message file
ls -lh ~/.kiro/q-messages.json

# View raw messages
cat ~/.kiro/q-messages.json | jq .

# Test MCP server
./test-cross-project.sh

# Restart Kiro IDE
# (Required after updating MCP configuration)
```

## Quick Examples

### Example 1: Cross-Project AWS Search
```javascript
get_related_messages({
  related_topics: ["AWS", "Lambda", "S3"],
  max_messages: 10
})
```

### Example 2: Project Comparison
```javascript
// View project A
kiro_status({ filter_project: "project-a", message_count: 5 })

// View project B
kiro_status({ filter_project: "project-b", message_count: 5 })
```

### Example 3: All Projects Overview
```javascript
list_projects({ show_details: true })
```

---

📚 **Full Documentation:** [CROSS_PROJECT_GUIDE.md](CROSS_PROJECT_GUIDE.md)  
🧪 **Test Features:** `./test-cross-project.sh`  
🔧 **Installation:** [README.md](README.md)
