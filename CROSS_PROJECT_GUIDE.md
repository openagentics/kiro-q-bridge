# Kiro-Q Bridge: Cross-Project Context Guide

## Overview

The Kiro-Q Bridge maintains a **global message history** that enables context sharing across all your Kiro projects. This guide explains how to leverage cross-project context for better AI collaboration.

## Architecture

```
~/.kiro/q-messages.json (Global Message Store)
    ↓
    ├─→ Project A (kiro-q-bridge-v4)
    ├─→ Project B (my-web-app)
    ├─→ Project C (data-pipeline)
    └─→ Project D (mobile-app)
```

**Key Concept:** All projects share the same message history, with each message tagged by project name.

## Message Structure

Every message includes project context:

```json
{
  "id": "kiro-v4-1764520494827",
  "timestamp": "2025-11-30T16:34:54-05:00",
  "project": "kiro-q-bridge-v4",
  "from": "Kiro",
  "to": "Amazon Q",
  "message": "...",
  "priority": "high"
}
```

## Cross-Project Features

### 1. List All Projects

See all projects with message activity:

```javascript
list_projects({
  show_details: true
})
```

**Output:**
```
📂 Projects in Kiro-Q Bridge

Total Projects: 4
Current Project: kiro-q-bridge-v4
Total Messages: 127

👉 kiro-q-bridge-v4
     Messages: 45 (Kiro: 30, Q: 15)
     Last Activity: 11/30/2025, 4:34:54 PM
     Topics: agentcore, bridge, architecture, aws, mcp

   my-web-app
     Messages: 38 (Kiro: 25, Q: 13)
     Last Activity: 11/28/2025, 2:15:30 PM
     Topics: react, authentication, api, deployment

   data-pipeline
     Messages: 32 (Kiro: 20, Q: 12)
     Last Activity: 11/25/2025, 10:45:12 AM
     Topics: lambda, s3, etl, performance, cost

   mobile-app
     Messages: 12 (Kiro: 8, Q: 4)
     Last Activity: 11/20/2025, 3:22:18 PM
     Topics: react-native, ios, android, push
```

### 2. Find Related Messages

Search for messages across projects by topic:

```javascript
get_related_messages({
  current_project: "kiro-q-bridge-v4",
  related_topics: ["AWS", "Lambda", "architecture"],
  max_messages: 10,
  exclude_current_project: true
})
```

**Use Cases:**
- Find similar problems solved in other projects
- Discover AWS patterns used elsewhere
- Learn from Q's advice in related contexts
- Avoid repeating questions across projects

**Output:**
```
🔍 Related Messages Across Projects

Current Project: kiro-q-bridge-v4
Search Topics: AWS, Lambda, architecture

✅ Found 5 related message(s)

1. [data-pipeline] Kiro → Amazon Q
   Time: 11/25/2025, 10:45:12 AM
   Preview: How should I architect a Lambda function that processes S3 events? 
            Need to handle 10k+ files per day with cost optimization...
   ID: kiro-v4-1764123456789

2. [my-web-app] Amazon Q → Kiro
   Time: 11/28/2025, 2:15:30 PM
   Preview: For your Lambda API architecture, I recommend using API Gateway 
            with Lambda proxy integration. This provides automatic scaling...
   ID: amazon-q-v4-1764234567890
```

### 3. Filter Messages by Project

View conversation history from a specific project:

```javascript
kiro_status({
  show_messages: true,
  message_count: 10,
  filter_project: "data-pipeline"
})
```

**Use Cases:**
- Review Q's advice for a specific project
- Understand context when switching projects
- Find previous solutions to similar problems
- Track project-specific conversations

### 4. View All Projects Together

See messages from all projects in one view:

```javascript
kiro_status({
  show_messages: true,
  message_count: 20,
  show_all_projects: true
})
```

**Output includes project tags:**
```
📝 Recent Conversation History (All Projects):

[4:34 PM] [kiro-q-bridge-v4] Kiro → Amazon Q:
What is Amazon AgentCore and how does it work?

[2:15 PM] [my-web-app] Amazon Q → Kiro:
For authentication, I recommend AWS Cognito with...

[10:45 AM] [data-pipeline] Kiro → Amazon Q:
How can I optimize Lambda cold starts?
```

## Command-Line Utilities

### View Messages Script

```bash
# View all messages from all projects
./view-messages.sh

# View messages for specific project
./view-messages.sh my-web-app

# View as JSON for processing
./view-messages.sh all json
./view-messages.sh my-web-app json
```

**Features:**
- Color-coded output
- Message truncation for readability
- Project filtering
- JSON export option
- Message statistics

### Link Messages Script

```bash
# Create symbolic link to global messages
./link-messages.sh
```

**What it does:**
- Creates `.kiro-q-messages.json` symlink in workspace
- Links to global `~/.kiro/q-messages.json`
- Backs up existing files
- Enables direct file access in workspace

## Practical Workflows

### Workflow 1: Learning from Past Projects

**Scenario:** Starting a new Lambda project, want to see Q's previous Lambda advice.

```javascript
// 1. Find Lambda-related messages
get_related_messages({
  related_topics: ["Lambda", "serverless", "AWS"],
  max_messages: 15
})

// 2. Deep dive into specific project
kiro_status({
  filter_project: "data-pipeline",
  message_count: 20
})

// 3. Ask Q with context
send_to_q({
  message: "I saw your Lambda advice in data-pipeline project. For my new project, 
           I need similar architecture but with API Gateway. Can you adapt that 
           approach for REST API use case?",
  priority: "high"
})
```

### Workflow 2: Cross-Project Pattern Discovery

**Scenario:** Want to understand how you've used AWS services across all projects.

```javascript
// 1. List all projects
list_projects({ show_details: true })

// 2. Search for AWS patterns
get_related_messages({
  related_topics: ["AWS", "architecture", "cost"],
  max_messages: 20,
  exclude_current_project: false  // Include all projects
})

// 3. Ask Q for synthesis
send_to_q({
  message: "Looking at our conversation history across projects, what AWS 
           architecture patterns have we used most successfully? What cost 
           optimization strategies have you recommended?",
  priority: "high"
})
```

### Workflow 3: Project Switching Context

**Scenario:** Switching from one project to another, need to recall context.

```javascript
// Before switching: Save current context
kiro_status({
  show_messages: true,
  message_count: 10,
  filter_project: "current-project"
})

// After switching: Load new project context
kiro_status({
  show_messages: true,
  message_count: 10,
  filter_project: "new-project"
})

// Find related work
get_related_messages({
  current_project: "new-project",
  related_topics: ["authentication", "API"],
  exclude_current_project: true
})
```

## Best Practices

### 1. Use Descriptive Project Names

Good project names help with filtering and discovery:
- ✅ `ecommerce-api-backend`
- ✅ `mobile-app-ios`
- ✅ `data-pipeline-etl`
- ❌ `project1`
- ❌ `test`
- ❌ `temp`

### 2. Tag Important Topics

When asking Q, mention key topics explicitly:

```javascript
send_to_q({
  message: "AWS Lambda cold start optimization for Node.js runtime with 
           API Gateway integration. Need sub-100ms response times.",
  priority: "high"
})
```

This makes future searches more effective.

### 3. Regular Cross-Project Reviews

Periodically review related messages:

```javascript
// Weekly: Review AWS-related discussions
get_related_messages({
  related_topics: ["AWS", "cost", "performance"],
  max_messages: 20
})

// Monthly: Review all projects
list_projects({ show_details: true })
```

### 4. Link Messages in Active Projects

For projects you work on frequently:

```bash
cd ~/projects/my-active-project
./link-messages.sh
```

This creates a local symlink for easy access.

### 5. Export for Documentation

Export project-specific conversations for documentation:

```bash
# Export as JSON
./view-messages.sh my-project json > docs/q-conversations.json

# Or create markdown documentation
./view-messages.sh my-project > docs/q-advice.txt
```

## Advanced Use Cases

### Multi-Project Architecture Decisions

When making architecture decisions that affect multiple projects:

```javascript
// 1. Review related decisions
get_related_messages({
  related_topics: ["architecture", "microservices", "database"],
  max_messages: 30
})

// 2. Ask Q with full context
send_to_q({
  message: "Based on our architecture discussions across data-pipeline, 
           my-web-app, and mobile-app projects, what's your recommendation 
           for a shared authentication service? Consider the patterns we've 
           already established.",
  priority: "high"
})
```

### Cost Optimization Across Projects

Track cost-related advice across all projects:

```javascript
get_related_messages({
  related_topics: ["cost", "optimization", "pricing", "budget"],
  max_messages: 50,
  exclude_current_project: false
})
```

### Learning from Q's Patterns

Identify Q's recurring recommendations:

```javascript
// Get all Q responses
kiro_status({
  show_messages: true,
  message_count: 100,
  show_all_projects: true
})

// Then ask Q to synthesize
send_to_q({
  message: "Looking at your responses across all my projects, what are the 
           top 5 AWS best practices you've recommended most frequently?",
  priority: "normal"
})
```

## Troubleshooting

### Messages Not Appearing

```bash
# Check global message file exists
ls -lh ~/.kiro/q-messages.json

# Check workspace link
ls -lh .kiro-q-messages.json

# View raw messages
cat ~/.kiro/q-messages.json | jq .
```

### Project Not Listed

```javascript
// Check if messages exist for project
list_projects({ show_details: true })

// Send a test message to create project entry
send_to_q({
  message: "Test message to initialize project in bridge",
  priority: "low"
})
```

### Cross-Project Search Not Finding Messages

```javascript
// Try broader search
get_related_messages({
  related_topics: [],  // Empty = all messages
  max_messages: 50,
  exclude_current_project: false
})

// Check available projects
list_projects({ show_details: true })
```

## File Locations

| File | Location | Purpose |
|------|----------|---------|
| Global Messages | `~/.kiro/q-messages.json` | Master message store |
| Workspace Link | `.kiro-q-messages.json` | Symlink to global (optional) |
| MCP Config (User) | `~/.kiro/settings/mcp.json` | Global bridge config |
| MCP Config (Workspace) | `.kiro/settings/mcp.json` | Project-specific config |

## Summary

The Kiro-Q Bridge's cross-project context system enables:

✅ **Knowledge Reuse** - Learn from Q's advice across all projects  
✅ **Pattern Discovery** - Identify successful approaches  
✅ **Context Switching** - Quickly recall project-specific conversations  
✅ **Architecture Consistency** - Apply proven patterns across projects  
✅ **Cost Optimization** - Track and apply cost-saving strategies  
✅ **Efficient Collaboration** - Avoid repeating questions  

Use the MCP tools and command-line utilities to leverage this powerful cross-project intelligence system!
