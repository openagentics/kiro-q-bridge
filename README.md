# Kiro-Q Bridge v4

## Clean, Fast, Reliable Bridge Between Kiro IDE and Amazon Q

### Issues Resolved from Previous Versions

**v3 Issues Fixed:**
- ❌ MCP timeout errors (-32001)
- ❌ Configuration conflicts (user vs workspace)
- ❌ Filename corruption and line breaks
- ❌ JSON-RPC 2.0 protocol non-compliance
- ❌ 7 competing MCP servers causing resource conflicts
- ❌ 67% code duplication and redundancy
- ❌ 200-500ms startup times
- ❌ Mixed Python/Node.js implementations

**v4 Solutions:**
- ✅ Single Node.js MCP server (<50ms startup)
- ✅ Clean JSON-RPC 2.0 protocol compliance
- ✅ Minimal codebase (5 essential files)
- ✅ Clear configuration management
- ✅ Robust error handling
- ✅ Fast message queuing system

### Architecture

```
kiro-q-bridge-v4/
├── mcp-server.js          # Single MCP server (Node.js) with project tags
├── config.json           # Project configuration
├── install.sh            # Simple installer
├── test.sh               # Test script
├── view-messages.sh      # View messages by project
├── link-messages.sh      # Link messages to current project
└── README.md             # This file
```

### Quick Start

1. Run installer: `./install.sh`
2. Restart Kiro IDE
3. Test connection with Q

### Features

- **Fast**: Sub-50ms startup time
- **Reliable**: Proper JSON-RPC 2.0 protocol
- **Simple**: 7 files, single responsibility
- **Portable**: Works on macOS, Linux, Windows
- **Project-Aware**: Global message history with project context tags
- **Utility Scripts**: View and link messages across projects