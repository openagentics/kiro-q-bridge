# What's New: Cross-Project Context Features

## 🎉 Major Update - December 1, 2025

The Kiro-Q Bridge now supports **full cross-project context sharing**! Access Q's advice, discover patterns, and leverage knowledge from all your Kiro projects.

## 🆕 New Features

### 1. Cross-Project Message Discovery

**Find related messages across all projects:**
```javascript
get_related_messages({
  related_topics: ["AWS", "Lambda", "architecture"],
  max_messages: 10
})
```

**Example Output:**
```
✅ Found 5 related message(s)

1. [data-pipeline] Kiro → Amazon Q
   Time: 11/25/2025, 10:45:12 AM
   Preview: How should I architect a Lambda function...
   
2. [my-web-app] Amazon Q → Kiro
   Time: 11/28/2025, 2:15:30 PM
   Preview: For your Lambda API architecture...
```

### 2. Project Overview

**See all projects with message activity:**
```javascript
list_projects({ show_details: true })
```

**Example Output:**
```
📂 Projects in Kiro-Q Bridge

Total Projects: 4
Current Project: kiro-q-bridge-v4

👉 kiro-q-bridge-v4
     Messages: 45 (Kiro: 30, Q: 15)
     Last Activity: 11/30/2025, 4:34:54 PM
     Topics: agentcore, bridge, architecture

   my-web-app
     Messages: 38 (Kiro: 25, Q: 13)
     Last Activity: 11/28/2025, 2:15:30 PM
     Topics: react, authentication, api
```

### 3. Project-Specific Message Filtering

**View messages from any project:**
```javascript
kiro_status({
  filter_project: "my-web-app",
  message_count: 10
})
```

**View messages from all projects:**
```javascript
kiro_status({
  show_all_projects: true,
  message_count: 20
})
```

### 4. Command-Line Utilities

**View messages in terminal:**
```bash
# All messages
./view-messages.sh

# Specific project
./view-messages.sh my-web-app

# Export as JSON
./view-messages.sh all json
```

**Link global messages to workspace:**
```bash
./link-messages.sh
```

## 📚 Documentation

### New Guides
- **CROSS_PROJECT_GUIDE.md** - Complete 458-line guide with workflows and examples
- **QUICK_REFERENCE.md** - Quick command reference for daily use
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

### Updated Files
- **README.md** - Updated with new features
- **install.sh** - Enhanced installation with utility setup

## 🎯 Use Cases

### Learning from Past Projects
```javascript
// Find AWS patterns used in other projects
get_related_messages({
  related_topics: ["AWS", "cost", "optimization"],
  max_messages: 20
})

// Ask Q to synthesize
send_to_q({
  message: "Based on our AWS discussions across projects, what are the top cost optimization strategies?",
  priority: "high"
})
```

### Context Switching
```javascript
// Before switching projects
kiro_status({ filter_project: "old-project", message_count: 5 })

// After switching
kiro_status({ filter_project: "new-project", message_count: 5 })

// Find related work
get_related_messages({
  related_topics: ["authentication", "API"]
})
```

### Architecture Decisions
```javascript
// Review architecture discussions across projects
get_related_messages({
  related_topics: ["architecture", "microservices", "database"],
  max_messages: 30
})
```

## 🚀 Getting Started

### 1. Update Your Installation
```bash
cd kiro-q-bridge-v4
git pull
./install.sh
```

### 2. Restart Kiro IDE
The new MCP tools will be available after restart.

### 3. Try the New Features
```javascript
// See all your projects
list_projects({ show_details: true })

// Find AWS-related messages
get_related_messages({
  related_topics: ["AWS"],
  max_messages: 10
})
```

### 4. Read the Documentation
- Start with **QUICK_REFERENCE.md** for commands
- Read **CROSS_PROJECT_GUIDE.md** for workflows
- Run `./test-cross-project.sh` to verify everything works

## 💡 Pro Tips

1. **Use descriptive project names** - Makes filtering and discovery easier
2. **Tag important topics** - Mention key terms in your messages to Q
3. **Regular reviews** - Check `get_related_messages()` weekly for insights
4. **Link active projects** - Run `./link-messages.sh` in frequently used projects
5. **Export for documentation** - Use `./view-messages.sh project json` to export

## 🧪 Testing

Run the comprehensive test suite:
```bash
./test-cross-project.sh
```

**Tests:**
- ✅ Utility scripts
- ✅ MCP server tools
- ✅ Global message file
- ✅ Cross-project search
- ✅ Project filtering
- ✅ Documentation

## 📊 What's Under the Hood

### Architecture
- **Global Message Store:** `~/.kiro/q-messages.json`
- **Project Tagging:** Every message tagged with project name
- **Symlink Support:** Optional workspace linking
- **Topic Search:** Keyword-based message discovery
- **Statistics Tracking:** Message counts, activity, topics per project

### New MCP Tools
1. `get_related_messages` - Cross-project search
2. `list_projects` - Project overview
3. Enhanced `kiro_status` - Project filtering

### Command-Line Utilities
1. `view-messages.sh` - Terminal message viewer
2. `link-messages.sh` - Symlink creator
3. `test-cross-project.sh` - Test suite

## 🎁 Benefits

✅ **Knowledge Reuse** - Access Q's advice from all projects  
✅ **Pattern Discovery** - Find successful approaches  
✅ **Context Switching** - Quickly recall conversations  
✅ **Efficient Collaboration** - Avoid repeating questions  
✅ **Cross-Project Learning** - Apply insights everywhere  
✅ **Architecture Consistency** - Use proven patterns  
✅ **Cost Optimization** - Track cost-saving strategies  

## 🔮 Future Possibilities

The foundation is now in place for:
- Semantic search with AI-powered similarity
- Automatic topic clustering
- Time-based analytics and trends
- Git integration (link messages to commits)
- Team collaboration features
- Documentation auto-generation

## 📞 Support

- **Documentation:** See CROSS_PROJECT_GUIDE.md
- **Quick Reference:** See QUICK_REFERENCE.md
- **Issues:** GitHub Issues
- **Testing:** Run `./test-cross-project.sh`

---

**Version:** 4.2.0  
**Release Date:** December 1, 2025  
**Status:** ✅ Production Ready  

**Enjoy your new cross-project AI knowledge management system!** 🚀
