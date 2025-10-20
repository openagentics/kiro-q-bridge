# Kiro-Q Bridge v4

## Clean, Fast, Reliable Bridge Between Kiro IDE and Amazon Q

A lightweight, production-ready MCP (Model Context Protocol) server that enables seamless communication between Kiro IDE and Amazon Q. This is a **global Kiro utility** that works across all your projects without needing to be open in the IDE.

## 🎯 What This Enables

Amazon Q can now directly communicate with Kiro IDE across ALL projects:
- ✅ Send messages to Kiro with priority levels
- ✅ Get real-time status of Kiro and active projects  
- ✅ Access workspace context and file information
- ✅ Monitor performance and resource usage
- ✅ Project-aware conversation history

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

```bash
# Clone and install
git clone https://github.com/ArtificialChatInc/kiro-q-bridge.git
cd kiro-q-bridge
./install.sh

# Restart Kiro IDE
# Test the connection (available in any project)
```

### Usage

Once installed, the bridge is available **globally** in Kiro IDE:

**Available Tools:**
- `kiro_status` - Get bridge status and current project info
- `send_to_q` - Send messages to Amazon Q with priority levels

**Message Management:**
```bash
# View all messages across projects
./view-messages.sh

# View messages for specific project
./view-messages.sh my-project-name

# Link message history to current project
./link-messages.sh
```

### Key Features

- **🚀 Fast**: Sub-50ms startup time (vs 200-500ms in v3)
- **🔒 Reliable**: Proper JSON-RPC 2.0 protocol compliance
- **🎯 Simple**: 7 files, single responsibility architecture
- **🌍 Portable**: Works on macOS, Linux, Windows
- **📁 Project-Aware**: Global message history with automatic project tagging
- **🛠️ Utility Scripts**: View and manage messages across all projects
- **🔧 Global Installation**: Works in ANY Kiro project without setup

### Why v4?

This version completely reimplements the bridge to solve critical issues:

| Issue | v3 | v4 |
|-------|----|----|
| Startup Time | 200-500ms | <50ms |
| MCP Timeouts | ❌ Frequent | ✅ None |
| Configuration | ❌ Conflicts | ✅ Clean |
| Architecture | ❌ 60+ files | ✅ 7 files |
| Protocol | ❌ Non-compliant | ✅ JSON-RPC 2.0 |
| Project Context | ❌ None | ✅ Auto-tagged |

### Message Format

Messages are stored globally with project context:

```json
{
  "id": "kiro-v4-1760985202589",
  "timestamp": "2025-10-20T18:33:22-05:00",
  "project": "my-awesome-project",
  "from": "Kiro",
  "to": "Amazon Q",
  "message": "Your message here",
  "priority": "high",
  "status": "queued",
  "version": "v4"
}
```

### Requirements

- **Kiro IDE** with MCP support
- **Node.js** (any recent version)
- **Amazon Q** access

## 🛠️ Available MCP Tools

Amazon Q has access to these tools for communicating with Kiro:

### 1. `kiro_status`
Get current Kiro IDE status and active project information
```json
{
  "timestamp": "2025-10-20T18:33:37-05:00",
  "version": "4.0.0",
  "bridge_active": true,
  "current_project": "kiro-q-bridge-v4",
  "kiro_dir": "/Users/[username]/.kiro",
  "message_file": "/Users/[username]/.kiro/q-messages.json",
  "server_type": "node-v4"
}
```

### 2. `send_to_q`
Send messages to Amazon Q with priority levels
```json
{
  "message": "Check the build status in your current project",
  "priority": "high"
}
```

## 🔄 Communication Flow

**Kiro → Q Messages (Project-Aware):**
1. User invokes `send_to_q` tool in Kiro
2. Message tagged with current project name
3. Stored in global queue at `~/.kiro/q-messages.json`
4. Amazon Q receives message with project context

**Q → Kiro Messages:**
1. Amazon Q sends messages through MCP protocol
2. Messages appear in conversation history
3. Project context maintained throughout conversation
4. Global message history accessible across all projects

## 📁 File Structure

```
~/
├── .kiro/
│   ├── settings/mcp.json        # MCP server configuration
│   └── q-messages.json          # Global message queue with project tags
└── Documents/kiro-q-bridge-v4/  # This repository (optional location)
    ├── mcp-server.js            # Main MCP server
    ├── install.sh               # Global installer
    ├── view-messages.sh         # Message viewer utility
    └── link-messages.sh         # Message linker utility
```
### Troubl
eshooting

**MCP Server Not Connecting?**
```bash
# Check if Node.js is in PATH
which node

# Test the server directly
./test.sh

# Restart Kiro IDE after installation
```

**Messages Not Appearing?**
- Ensure Kiro IDE is restarted after installation
- Check MCP server status in Kiro's feature panel
- Verify `~/.kiro/q-messages.json` exists after sending a message

**Bridge Not Starting?**
```bash
# Check Node.js version
node --version

# Test server directly
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}' | node mcp-server.js

# Check MCP configuration
cat ~/.kiro/settings/mcp.json
```

## 🌟 Use Cases

### 1. **Proactive Monitoring**
Amazon Q detects issues and sends alerts to Kiro:
> "High memory usage detected in your-project project"

### 2. **Cross-Project Coordination** 
Q manages multiple Kiro projects simultaneously:
> "Switch to project X and run tests while Y is building"

### 3. **Performance Optimization**
Q analyzes patterns and suggests improvements:
> "Consider using npm ci instead of npm install for faster builds"

### 4. **Development Assistance**
Q provides context-aware help based on current project:
> "I see you're working on kiro-q-bridge-v4. The test.sh script shows all tests passing."

## 🔒 Security Features

- **Safe Operation**: Read-only status monitoring
- **Project Isolation**: Messages tagged by project but stored globally
- **No Command Execution**: v4 focuses on communication, not command execution
- **Audit Trail**: All messages logged with timestamps and project context

### Contributing

This is an open-source project. Contributions welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### License

MIT License - see repository for details.

## 🎉 Benefits

✅ **Direct Communication** - No more manual relay between Q and Kiro  
✅ **Global Coverage** - Works across ALL Kiro projects  
✅ **Real-time Status** - Q always knows what Kiro is doing  
✅ **Project Awareness** - Messages tagged with project context  
✅ **Persistent History** - Messages survive Kiro restarts  
✅ **Zero Configuration** - Works in any project after installation  
✅ **Fast & Reliable** - Sub-50ms startup, proper JSON-RPC 2.0  

## 🔍 Monitoring

**View Message History:**
```bash
# View all messages across projects
./view-messages.sh

# View messages for specific project  
./view-messages.sh my-project-name

# View raw message file
cat ~/.kiro/q-messages.json | jq .
```

**Real-time Status:**
Use the `kiro_status` tool in Kiro to see:
- Bridge running status
- Current project detection
- Message file location
- Server version and type

## 🚀 Migration from v3

If you're upgrading from v3, see the [V4_MIGRATION_GUIDE.md](V4_MIGRATION_GUIDE.md) for detailed instructions. Key improvements:
- **60+ files → 7 files**: Dramatically simplified architecture
- **Python → Node.js**: Faster startup and better MCP integration  
- **Multiple servers → Single server**: No more configuration conflicts
- **Project-specific files → Global with tags**: Simpler management

### Support

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: See the migration guides for detailed setup
- **Previous Version**: [kiro-q-bridge v3](https://github.com/ArtificialChatInc/kiro-q-bridge) (legacy)

---

**Amazon Q can now be your AI pair programming partner that actively collaborates with Kiro!** 🤖🚀

**Made with ❤️ for the Kiro IDE community**