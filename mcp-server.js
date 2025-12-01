#!/usr/bin/env node
/**
 * Kiro-Q Bridge v4 MCP Server
 * Clean, fast, JSON-RPC 2.0 compliant
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Configuration
const CONFIG = {
    protocolVersion: '2024-11-05',
    serverName: 'kiro-q-bridge-v4',
    serverVersion: '4.0.0',
    messageFile: path.join(process.cwd(), '.kiro-q-messages.json'), // Move to workspace root
    fallbackMessageFile: path.join(os.homedir(), '.kiro', 'q-messages.json') // Keep backup location
};

// Get current project name from working directory
function getCurrentProject() {
    try {
        const cwd = process.cwd();
        const projectName = path.basename(cwd);
        return projectName || 'unknown-project';
    } catch (error) {
        return 'unknown-project';
    }
}

// Create Q session initialization prompt
function createQSessionInitPrompt() {
    const project = getCurrentProject();
    const workspace = process.cwd();
    const timestamp = getTimestamp();
    
    // Count pending messages
    let pendingCount = 0;
    if (fs.existsSync(CONFIG.messageFile)) {
        try {
            const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
            const messages = JSON.parse(data);
            pendingCount = messages.filter(msg => 
                msg.from === 'Kiro' && 
                msg.to === 'Amazon Q' && 
                msg.status === 'queued'
            ).length;
        } catch (e) {
            // Ignore errors
        }
    }
    
    return `🌉 KIRO-Q BRIDGE SESSION INITIALIZATION

Amazon Q, this is Kiro IDE establishing a new collaboration session. Here's what you need to know:

## Your Role
You are the **AWS and cloud architecture expert** supporting Kiro IDE. Kiro handles IDE operations, code editing, and local development. You provide AWS expertise, cloud architecture guidance, and advanced reasoning.

## How the Bridge Works

### Message System
- **Location**: Messages at ~/.kiro/q-messages.json or workspace .kiro-q-messages.json
- **HTTP API**: Available at http://localhost:3847/api/messages
- **Your Tools**: Use MCP tools to check messages and respond

### Checking for Messages
Use these MCP tools:
1. \`kiro_status\` - See pending messages from Kiro
2. \`send_to_q\` with \`from: "Amazon Q"\` - Send responses back to Kiro

### Message Flow
\`\`\`
User → Kiro → Bridge → Q (you check messages)
                    ↓
User ← Kiro ← Bridge ← Q (you respond)
\`\`\`

## Your Responsibilities

1. **Check Messages Proactively** - When user mentions "check bridge" or during conversations
2. **Respond via Bridge** - Use \`send_to_q\` tool with \`from: "Amazon Q"\`
3. **Provide AWS Expertise** - AWS services, architecture, cost optimization, security
4. **Collaborate with Kiro** - Kiro handles files/code, you handle AWS/cloud strategy

## Current Session Context

- **Project**: ${project}
- **Workspace**: ${workspace}
- **Pending Messages**: ${pendingCount}
- **Session Started**: ${timestamp}

## Quick Start

Check for messages:
\`\`\`javascript
kiro_status({ show_messages: true, message_count: 10 })
\`\`\`

Respond to Kiro:
\`\`\`javascript
send_to_q({
  message: "Your response here",
  from: "Amazon Q",
  reply_to: "message-id-here"
})
\`\`\`

⚠️ **Memory Loss**: You lose all context between sessions. Kiro maintains persistent memory.
✅ **Bridge is Active**: Ready for collaboration.
🎯 **Your Mission**: Provide AWS and cloud expertise to enhance Kiro's capabilities.

**Please acknowledge by checking for pending messages using \`kiro_status\`.**`;
}

// Ensure message file exists and migrate from old location if needed
function ensureMessageFile() {
    // Check if workspace file exists
    if (!fs.existsSync(CONFIG.messageFile)) {
        // Try to migrate from old location
        if (fs.existsSync(CONFIG.fallbackMessageFile)) {
            try {
                const data = fs.readFileSync(CONFIG.fallbackMessageFile, 'utf8');
                fs.writeFileSync(CONFIG.messageFile, data);
                console.error(`[MIGRATION] Moved messages from ${CONFIG.fallbackMessageFile} to ${CONFIG.messageFile}`);
            } catch (error) {
                console.error(`[MIGRATION ERROR] Could not migrate messages: ${error.message}`);
                // Create empty file
                fs.writeFileSync(CONFIG.messageFile, '[]');
            }
        } else {
            // Create empty file
            fs.writeFileSync(CONFIG.messageFile, '[]');
        }
    }
    
    // Also ensure backup directory exists
    const backupDir = path.dirname(CONFIG.fallbackMessageFile);
    if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
    }
    
    return path.dirname(CONFIG.messageFile);
}

// Ensure .kiro directory exists (for compatibility)
function ensureKiroDir() {
    const kiroDir = path.join(os.homedir(), '.kiro');
    if (!fs.existsSync(kiroDir)) {
        fs.mkdirSync(kiroDir, { recursive: true });
    }
    return kiroDir;
}

// Get timestamp in Eastern time
function getTimestamp() {
    const now = new Date();
    const eastern = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    return eastern.toISOString().split('.')[0] + '-05:00';
}

// Create JSON-RPC 2.0 response
function createResponse(id, result = null, error = null) {
    const response = { jsonrpc: '2.0', id };
    if (error) {
        response.error = error;
    } else {
        response.result = result;
    }
    return response;
}

// Handle MCP requests
function handleRequest(request) {
    const { method, params = {}, id } = request;
    
    try {
        switch (method) {
            case 'initialize':
                return createResponse(id, {
                    protocolVersion: CONFIG.protocolVersion,
                    capabilities: {
                        tools: {},
                        resources: {},
                        prompts: {}
                    },
                    serverInfo: {
                        name: CONFIG.serverName,
                        version: CONFIG.serverVersion
                    }
                });
                
            case 'initialized':
                return createResponse(id, {});
                
            case 'tools/list':
                return createResponse(id, {
                    tools: [
                        {
                            name: 'kiro_status',
                            description: 'Complete Kiro-Q Bridge session manager: status, conversation history, wake up Q, and handle all session communication in one call',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    show_messages: { type: 'boolean', default: true, description: 'Include recent conversation history' },
                                    message_count: { type: 'number', default: 5, description: 'Number of recent messages to show' },
                                    check_for_responses: { type: 'boolean', default: true, description: 'Check for messages needing Q responses' },
                                    auto_respond: { type: 'boolean', default: true, description: 'Automatically wake up Q and handle responses' },
                                    session_init: { type: 'boolean', default: true, description: 'Initialize new session - wake up Q and establish communication' },
                                    respond_as_q: { type: 'boolean', default: false, description: 'ONLY for verified Amazon Q responses - NEVER for simulation when Q is offline' },
                                    q_response_message: { type: 'string', description: 'Message for Q to send (when respond_as_q=true)' },
                                    filter_project: { type: 'string', description: 'Filter messages by specific project name (optional)' },
                                    show_all_projects: { type: 'boolean', default: false, description: 'Show messages from all projects, not just current' }
                                },
                                required: []
                            }
                        },
                        {
                            name: 'send_to_q',
                            description: 'Send message to Amazon Q or respond as Q to Kiro',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', description: 'Message content' },
                                    priority: { type: 'string', enum: ['low', 'normal', 'high'], default: 'normal' },
                                    from: { type: 'string', enum: ['Kiro', 'Amazon Q'], default: 'Kiro', description: 'Who is sending the message' },
                                    reply_to: { type: 'string', description: 'Message ID this is replying to (optional)' }
                                },
                                required: ['message']
                            }
                        },
                        {
                            name: 'ask_q',
                            description: 'Intelligent routing tool that automatically sends questions to Amazon Q and retrieves responses. Use this for AWS services, Q capabilities, cloud architecture, or any Q-specific knowledge. Handles the complete workflow: send question → wait for Q → return answer.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    question: { type: 'string', description: 'The question to ask Amazon Q' },
                                    context: { type: 'string', description: 'Optional context about why you are asking (helps Q provide better answers)' },
                                    priority: { type: 'string', enum: ['low', 'normal', 'high'], default: 'high' },
                                    max_wait_seconds: { type: 'number', default: 30, description: 'Maximum seconds to wait for Q response (default: 30)' },
                                    poll_interval_seconds: { type: 'number', default: 2, description: 'Seconds between polling checks (default: 2)' }
                                },
                                required: ['question']
                            }
                        },
                        {
                            name: 'init_q_session',
                            description: 'Initialize Amazon Q session with context about the bridge and current project. Call this at the start of each Kiro session or when opening a new chat tab. Q loses all memory between sessions, so this re-establishes the collaboration context.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    notify_user: { type: 'boolean', default: true, description: 'Show user that Q session is being initialized' }
                                },
                                required: []
                            }
                        },
                        {
                            name: 'get_related_messages',
                            description: 'Get messages related to current context from other projects. Useful for finding cross-project insights, similar discussions, or related work.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    current_project: { type: 'string', description: 'Current project name (defaults to auto-detected)' },
                                    related_topics: { type: 'array', items: { type: 'string' }, description: 'Topics or keywords to search for (e.g., ["AWS", "AgentCore"])' },
                                    max_messages: { type: 'number', default: 10, description: 'Maximum number of related messages to return' },
                                    exclude_current_project: { type: 'boolean', default: true, description: 'Exclude messages from current project' }
                                },
                                required: []
                            }
                        },
                        {
                            name: 'list_projects',
                            description: 'List all projects that have messages in the bridge, with message counts and recent activity.',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    show_details: { type: 'boolean', default: true, description: 'Show detailed statistics for each project' }
                                },
                                required: []
                            }
                        }
                    ]
                });
                
            case 'tools/call':
                return handleToolCall(id, params);
                
            default:
                return createResponse(id, null, {
                    code: -32601,
                    message: `Method not found: ${method}`
                });
        }
    } catch (error) {
        return createResponse(id, null, {
            code: -32603,
            message: `Internal error: ${error.message}`
        });
    }
}

// Handle tool calls
function handleToolCall(id, params) {
    const { name: toolName, arguments: args = {} } = params;
    
    switch (toolName) {
        case 'kiro_status':
            const kiroDir = ensureKiroDir();
            const showMessages = args.show_messages !== false;
            let messageCount = args.message_count || 5;
            const checkForResponses = args.check_for_responses !== false;
            const autoRespond = args.auto_respond !== false; // Default to true now
            const sessionInit = args.session_init === true;
            const respondAsQ = args.respond_as_q === true;
            const qResponseMessage = args.q_response_message || '';
            const filterProject = args.filter_project || null;
            const showAllProjects = args.show_all_projects === true;
            
            // Enhanced input validation for kiro_status
            if (messageCount < 1 || messageCount > 50) {
                messageCount = Math.max(1, Math.min(50, messageCount));
            }
            
            // CRITICAL VALIDATION: Prevent Q simulation
            if (respondAsQ && !qResponseMessage.trim()) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'When respond_as_q=true, q_response_message is required and cannot be empty.'
                });
            }
            
            if (respondAsQ) {
                // Additional safeguard: Log attempt to use respond_as_q
                console.error(`[SECURITY] respond_as_q=true called at ${getTimestamp()} - Validating Q activity...`);
            }
            
            if (qResponseMessage.length > 5000) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Q response message too long. Maximum length is 5,000 characters.'
                });
            }
            
            const messageDir = ensureMessageFile();
            const status = {
                timestamp: getTimestamp(),
                version: CONFIG.serverVersion,
                bridge_active: true,
                message_dir: messageDir,
                message_file: CONFIG.messageFile,
                workspace_accessible: true, // Q can access without permissions
                server_type: 'node-v4',
                current_project: getCurrentProject()
            };
            
            let statusText = `🟢 Kiro-Q Bridge v4 Session Manager\n\n${JSON.stringify(status, null, 2)}`;
            let pendingMessages = [];
            let allMessages = [];
            let actionsPerformed = [];
            
            // Session initialization
            if (sessionInit) {
                actionsPerformed.push('🚀 SESSION INITIALIZED - Bridge ready for new session');
            }
            
            // Load and analyze messages
            if (fs.existsSync(CONFIG.messageFile)) {
                try {
                    const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
                    allMessages = JSON.parse(data);
                    
                    // Find messages from Kiro that need Q responses
                    if (checkForResponses) {
                        const kiroMessages = allMessages.filter(msg => 
                            msg.from === 'Kiro' && 
                            msg.to === 'Amazon Q' && 
                            msg.status === 'queued'
                        );
                        
                        // Check if each Kiro message has a corresponding Q response
                        pendingMessages = kiroMessages.filter(kiroMsg => {
                            const hasResponse = allMessages.some(qMsg => 
                                qMsg.from === 'Amazon Q' && 
                                qMsg.to === 'Kiro' && 
                                (qMsg.reply_to === kiroMsg.id || 
                                 new Date(qMsg.timestamp) > new Date(kiroMsg.timestamp))
                            );
                            return !hasResponse;
                        });
                    }
                } catch (e) {
                    statusText += '\n\n⚠️ Could not load conversation history';
                }
            }
            
            // CRITICAL SAFEGUARD: Only allow Q responses from actual Amazon Q
            // This prevents Kiro from simulating Q when Q is offline
            if (respondAsQ && pendingMessages.length > 0 && qResponseMessage) {
                actionsPerformed.push(`🔍 SECURITY CHECK: respondAsQ=${respondAsQ}, pending=${pendingMessages.length}, hasMessage=${!!qResponseMessage}`);
                // ANTI-SIMULATION PROTECTION: Check for legitimate Q activity
                // Find the last legitimate Q message (before simulation started on Oct 22)
                const simulationStartTime = new Date('2025-10-22T19:00:00-05:00').getTime();
                const lastLegitimateQ = allMessages
                    .filter(msg => 
                        msg.from === 'Amazon Q' && 
                        new Date(msg.timestamp).getTime() < simulationStartTime
                    )
                    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                
                const hoursSinceLastLegitimateQ = lastLegitimateQ ? 
                    (Date.now() - new Date(lastLegitimateQ.timestamp).getTime()) / (1000 * 60 * 60) : 999;
                
                console.error(`[SECURITY] Last legitimate Q: ${lastLegitimateQ ? lastLegitimateQ.timestamp : 'NONE'}, Hours ago: ${Math.round(hoursSinceLastLegitimateQ)}`);
                
                // DEBUG: Add to status for visibility
                actionsPerformed.push(`🔍 DEBUG: Last legitimate Q activity ${Math.round(hoursSinceLastLegitimateQ)} hours ago`);
                
                // Block simulation if no legitimate Q activity in last 2 hours
                if (hoursSinceLastLegitimateQ > 2) {
                    actionsPerformed.push(`🚨 SIMULATION BLOCKED: No legitimate Amazon Q activity in ${Math.round(hoursSinceLastLegitimateQ)} hours. Cannot respond as Q when Q is offline.`);
                    statusText += `\n\n🚨 CRITICAL PROTECTION ACTIVATED:\nBlocked attempt to simulate Amazon Q response.\nLast legitimate Q activity: ${Math.round(hoursSinceLastLegitimateQ)} hours ago.\nAmazon Q must be actively connected to respond.\n`;
                } else {
                    const latestPending = pendingMessages[pendingMessages.length - 1];
                    
                    const qMessageData = {
                        id: `amazon-q-v4-${Date.now()}`,
                        timestamp: getTimestamp(),
                        project: getCurrentProject(),
                        from: 'Amazon Q',
                        to: 'Kiro',
                        message: qResponseMessage.trim(),
                        priority: 'normal',
                        reply_to: latestPending.id,
                        status: 'delivered',
                        version: 'v4',
                        verified_q_response: true // Mark as verified Q response
                    };
                    
                    allMessages.push(qMessageData);
                    
                    // Keep only last 100 messages
                    if (allMessages.length > 100) {
                        allMessages = allMessages.slice(-100);
                    }
                    
                    fs.writeFileSync(CONFIG.messageFile, JSON.stringify(allMessages, null, 2));
                    actionsPerformed.push(`📨 Q RESPONDED: "${qResponseMessage.substring(0, 60)}..."`);
                    
                    // Remove the responded message from pending
                    pendingMessages = pendingMessages.filter(msg => msg.id !== latestPending.id);
                }
            }
            
            // Add conversation history if requested
            if (showMessages && allMessages.length > 0) {
                let messagesToShow = allMessages;
                
                // Apply project filtering
                if (filterProject) {
                    messagesToShow = allMessages.filter(msg => msg.project === filterProject);
                    statusText += `\n\n📝 Conversation History (Project: ${filterProject}):\n`;
                } else if (!showAllProjects) {
                    // Default: show only current project
                    const currentProj = getCurrentProject();
                    messagesToShow = allMessages.filter(msg => msg.project === currentProj);
                    statusText += `\n\n📝 Recent Conversation History (Current Project: ${currentProj}):\n`;
                } else {
                    statusText += '\n\n📝 Recent Conversation History (All Projects):\n';
                }
                
                const recentMessages = messagesToShow.slice(-messageCount);
                
                if (recentMessages.length === 0) {
                    statusText += '\n❌ No messages found for the specified filter\n';
                    if (filterProject) {
                        statusText += `\n💡 Use list_projects to see available projects\n`;
                    }
                } else {
                    recentMessages.forEach(msg => {
                        const time = new Date(msg.timestamp).toLocaleTimeString();
                        const preview = msg.message.length > 100 ? 
                            msg.message.substring(0, 100) + '...' : msg.message;
                        const projectTag = showAllProjects ? `[${msg.project}] ` : '';
                        statusText += `\n[${time}] ${projectTag}${msg.from} → ${msg.to}:\n${preview}\n`;
                    });
                }
            }
            
            // Show actions performed in this session call
            if (actionsPerformed.length > 0) {
                statusText += '\n\n🎯 Session Actions Performed:\n';
                actionsPerformed.forEach(action => {
                    statusText += `\n${action}`;
                });
                statusText += '\n';
            }
            
            // Alert about remaining pending messages
            if (pendingMessages.length > 0) {
                statusText += `\n\n🔔 ALERT: ${pendingMessages.length} message(s) from Kiro still awaiting Amazon Q response:\n`;
                pendingMessages.forEach((msg, index) => {
                    const time = new Date(msg.timestamp).toLocaleTimeString();
                    const preview = msg.message.length > 80 ? 
                        msg.message.substring(0, 80) + '...' : msg.message;
                    statusText += `\n${index + 1}. [${time}] ID: ${msg.id}\n   "${preview}"\n`;
                });
                
                if (autoRespond) {
                    statusText += '\n⚠️  PENDING RESPONSES: Amazon Q must be actively connected to respond.\n';
                    statusText += '💡 TIP: Only use respond_as_q=true when Amazon Q is verified active (not for simulation).\n';
                } else {
                    statusText += '\n💡 TIP: Amazon Q should use send_to_q with from="Amazon Q" to respond to these messages.\n';
                }
            } else if (checkForResponses) {
                statusText += '\n\n✅ No pending messages - all Kiro messages have been responded to by Amazon Q.\n';
            }
            
            // Session summary
            statusText += `\n\n📊 Session Summary:\n`;
            statusText += `- Bridge Status: Active\n`;
            statusText += `- Total Messages: ${allMessages.length}\n`;
            statusText += `- Pending Responses: ${pendingMessages.length}\n`;
            statusText += `- Actions This Call: ${actionsPerformed.length}\n`;
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: statusText
                }]
            });
            
        case 'send_to_q':
            const message = args.message || '';
            const priority = args.priority || 'normal';
            const from = args.from || 'Kiro';
            const replyTo = args.reply_to || null;
            
            // Enhanced input validation
            if (!message.trim()) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Message cannot be empty. Please provide a message to send.'
                });
            }
            
            if (message.length > 10000) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Message too long. Maximum length is 10,000 characters.'
                });
            }
            
            if (!['low', 'normal', 'high'].includes(priority)) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Invalid priority. Must be "low", "normal", or "high".'
                });
            }
            
            if (!['Kiro', 'Amazon Q'].includes(from)) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Invalid sender. Must be "Kiro" or "Amazon Q".'
                });
            }
            
            // Determine recipient based on sender
            const to = from === 'Kiro' ? 'Amazon Q' : 'Kiro';
            
            const messageData = {
                id: `${from.toLowerCase().replace(' ', '-')}-v4-${Date.now()}`,
                timestamp: getTimestamp(),
                project: getCurrentProject(),
                from: from,
                to: to,
                message: message.trim(),
                priority,
                reply_to: replyTo,
                status: from === 'Amazon Q' ? 'delivered' : 'queued',
                version: 'v4'
            };
            
            // Save message to queue
            ensureMessageFile();
            let messages = [];
            
            if (fs.existsSync(CONFIG.messageFile)) {
                try {
                    const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
                    messages = JSON.parse(data);
                } catch (e) {
                    messages = [];
                }
            }
            
            messages.push(messageData);
            
            // Keep only last 100 messages
            if (messages.length > 100) {
                messages = messages.slice(-100);
            }
            
            fs.writeFileSync(CONFIG.messageFile, JSON.stringify(messages, null, 2));
            
            // Create appropriate response message
            const actionText = from === 'Kiro' ? 'sent to Amazon Q' : 'sent to Kiro';
            const responseIcon = from === 'Kiro' ? '✅' : '📨';
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: `${responseIcon} Message ${actionText}\n\nID: ${messageData.id}\nFrom: ${from}\nTo: ${to}\nMessage: ${message}\nPriority: ${priority}\nTimestamp: ${messageData.timestamp}${replyTo ? `\nReplying to: ${replyTo}` : ''}`
                }]
            });
            
        case 'init_q_session':
            const notifyUser = args.notify_user !== false;
            
            // Create initialization prompt
            const initPrompt = createQSessionInitPrompt();
            
            // Send to Q
            ensureMessageFile();
            let initMessages = [];
            
            if (fs.existsSync(CONFIG.messageFile)) {
                try {
                    const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
                    initMessages = JSON.parse(data);
                } catch (e) {
                    initMessages = [];
                }
            }
            
            const initMsg = {
                id: `kiro-v4-${Date.now()}`,
                timestamp: getTimestamp(),
                project: getCurrentProject(),
                from: 'Kiro',
                to: 'Amazon Q',
                message: initPrompt,
                priority: 'high',
                reply_to: null,
                status: 'queued',
                version: 'v4',
                session_init: true
            };
            
            initMessages.push(initMsg);
            
            if (initMessages.length > 100) {
                initMessages = initMessages.slice(-100);
            }
            
            fs.writeFileSync(CONFIG.messageFile, JSON.stringify(initMessages, null, 2));
            
            let responseText = `🌉 Q SESSION INITIALIZED\n\n`;
            responseText += `✅ Sent initialization prompt to Amazon Q\n`;
            responseText += `📨 Message ID: ${initMsg.id}\n`;
            responseText += `📍 Project: ${getCurrentProject()}\n`;
            responseText += `⏰ Timestamp: ${initMsg.timestamp}\n\n`;
            
            if (notifyUser) {
                responseText += `💡 **Next Step**: Tell Amazon Q to check the bridge:\n`;
                responseText += `   "Amazon Q, please check the Kiro-Q Bridge for the session initialization message"\n\n`;
                responseText += `Once Q acknowledges, the bridge will be ready for seamless collaboration!`;
            }
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: responseText
                }]
            });
            
        case 'ask_q':
            const question = args.question || '';
            const context = args.context || '';
            const askPriority = args.priority || 'high';
            const maxWaitSeconds = args.max_wait_seconds || 30;
            const pollIntervalSeconds = args.poll_interval_seconds || 2;
            
            // Validate inputs
            if (!question.trim()) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Question cannot be empty.'
                });
            }
            
            // Build the message to Q
            let fullMessage = `🤔 QUESTION FROM KIRO\n\n${question}`;
            if (context) {
                fullMessage += `\n\n**Context:** ${context}`;
            }
            fullMessage += `\n\n**Instructions:** Please provide a comprehensive answer. This is an automated routing from the Kiro-Q Bridge that will display your response directly to the user.`;
            
            // Send question to Q
            ensureMessageFile();
            let allMsgs = [];
            
            if (fs.existsSync(CONFIG.messageFile)) {
                try {
                    const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
                    allMsgs = JSON.parse(data);
                } catch (e) {
                    allMsgs = [];
                }
            }
            
            const questionMsg = {
                id: `kiro-v4-${Date.now()}`,
                timestamp: getTimestamp(),
                project: getCurrentProject(),
                from: 'Kiro',
                to: 'Amazon Q',
                message: fullMessage,
                priority: askPriority,
                reply_to: null,
                status: 'queued',
                version: 'v4',
                auto_routed: true
            };
            
            allMsgs.push(questionMsg);
            
            if (allMsgs.length > 100) {
                allMsgs = allMsgs.slice(-100);
            }
            
            fs.writeFileSync(CONFIG.messageFile, JSON.stringify(allMsgs, null, 2));
            
            // Poll for Q's response
            const startTime = Date.now();
            const maxWaitMs = maxWaitSeconds * 1000;
            const pollIntervalMs = pollIntervalSeconds * 1000;
            let qResponse = null;
            let attempts = 0;
            
            function sleep(ms) {
                const start = Date.now();
                while (Date.now() - start < ms) {
                    // Busy wait (not ideal but works for MCP server context)
                }
            }
            
            while (Date.now() - startTime < maxWaitMs) {
                attempts++;
                sleep(pollIntervalMs);
                
                // Check for Q's response
                try {
                    const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
                    const currentMsgs = JSON.parse(data);
                    
                    // Look for Q's response after our question
                    const qResponses = currentMsgs.filter(msg => 
                        msg.from === 'Amazon Q' &&
                        msg.to === 'Kiro' &&
                        new Date(msg.timestamp) > new Date(questionMsg.timestamp) &&
                        (msg.reply_to === questionMsg.id || 
                         new Date(msg.timestamp).getTime() - new Date(questionMsg.timestamp).getTime() < 60000)
                    );
                    
                    if (qResponses.length > 0) {
                        qResponse = qResponses[qResponses.length - 1];
                        break;
                    }
                } catch (e) {
                    // Continue polling
                }
            }
            
            const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
            
            if (qResponse) {
                return createResponse(id, {
                    content: [{
                        type: 'text',
                        text: `🎯 AMAZON Q RESPONSE (received in ${elapsedSeconds}s after ${attempts} polls)\n\n${qResponse.message}\n\n---\n📊 Routing Stats:\n- Question ID: ${questionMsg.id}\n- Response ID: ${qResponse.id}\n- Wait Time: ${elapsedSeconds}s\n- Poll Attempts: ${attempts}`
                    }]
                });
            } else {
                return createResponse(id, {
                    content: [{
                        type: 'text',
                        text: `⏳ TIMEOUT: Amazon Q did not respond within ${maxWaitSeconds} seconds.\n\n📨 Your question has been sent to Q (ID: ${questionMsg.id})\n\nYou can check for Q's response later using:\n- kiro_status tool with show_messages=true\n- Or check the message file directly\n\n💡 Q may still respond - the message is queued and waiting for Q's attention.`
                    }]
                });
            }
            
        case 'get_related_messages':
            const currentProj = args.current_project || getCurrentProject();
            const relatedTopics = args.related_topics || [];
            const maxMessages = args.max_messages || 10;
            const excludeCurrent = args.exclude_current_project !== false;
            
            ensureMessageFile();
            let relatedMessages = [];
            let relatedText = `🔍 Related Messages Across Projects\n\n`;
            relatedText += `Current Project: ${currentProj}\n`;
            relatedText += `Search Topics: ${relatedTopics.length > 0 ? relatedTopics.join(', ') : 'All'}\n\n`;
            
            if (fs.existsSync(CONFIG.messageFile)) {
                try {
                    const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
                    const allMsgs = JSON.parse(data);
                    
                    // Filter messages
                    relatedMessages = allMsgs.filter(msg => {
                        // Exclude current project if requested
                        if (excludeCurrent && msg.project === currentProj) {
                            return false;
                        }
                        
                        // If no topics specified, include all
                        if (relatedTopics.length === 0) {
                            return true;
                        }
                        
                        // Check if message contains any of the topics
                        const msgText = (msg.message || '').toLowerCase();
                        return relatedTopics.some(topic => 
                            msgText.includes(topic.toLowerCase())
                        );
                    });
                    
                    // Sort by timestamp (most recent first)
                    relatedMessages.sort((a, b) => 
                        new Date(b.timestamp) - new Date(a.timestamp)
                    );
                    
                    // Limit results
                    relatedMessages = relatedMessages.slice(0, maxMessages);
                    
                    if (relatedMessages.length === 0) {
                        relatedText += '❌ No related messages found\n\n';
                        relatedText += 'Try:\n';
                        relatedText += '- Broadening your search topics\n';
                        relatedText += '- Including current project (exclude_current_project: false)\n';
                        relatedText += '- Using list_projects to see available projects\n';
                    } else {
                        relatedText += `✅ Found ${relatedMessages.length} related message(s)\n\n`;
                        
                        relatedMessages.forEach((msg, index) => {
                            const time = new Date(msg.timestamp).toLocaleString();
                            const preview = msg.message.length > 150 ? 
                                msg.message.substring(0, 150) + '...' : msg.message;
                            
                            relatedText += `${index + 1}. [${msg.project}] ${msg.from} → ${msg.to}\n`;
                            relatedText += `   Time: ${time}\n`;
                            relatedText += `   Preview: ${preview}\n`;
                            relatedText += `   ID: ${msg.id}\n\n`;
                        });
                        
                        relatedText += `💡 Use kiro_status with filter_project to see full messages from a specific project\n`;
                    }
                } catch (e) {
                    relatedText += `⚠️ Error reading messages: ${e.message}\n`;
                }
            } else {
                relatedText += '❌ No message file found\n';
            }
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: relatedText
                }]
            });
            
        case 'list_projects':
            const showDetails = args.show_details !== false;
            
            ensureMessageFile();
            let projectsText = `📂 Projects in Kiro-Q Bridge\n\n`;
            
            if (fs.existsSync(CONFIG.messageFile)) {
                try {
                    const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
                    const allMsgs = JSON.parse(data);
                    
                    // Group messages by project
                    const projectStats = {};
                    allMsgs.forEach(msg => {
                        const proj = msg.project || 'unknown';
                        if (!projectStats[proj]) {
                            projectStats[proj] = {
                                total: 0,
                                fromKiro: 0,
                                fromQ: 0,
                                lastActivity: null,
                                topics: new Set()
                            };
                        }
                        
                        projectStats[proj].total++;
                        if (msg.from === 'Kiro') projectStats[proj].fromKiro++;
                        if (msg.from === 'Amazon Q') projectStats[proj].fromQ++;
                        
                        const msgTime = new Date(msg.timestamp);
                        if (!projectStats[proj].lastActivity || msgTime > projectStats[proj].lastActivity) {
                            projectStats[proj].lastActivity = msgTime;
                        }
                        
                        // Extract potential topics (simple keyword extraction)
                        const words = msg.message.toLowerCase().match(/\b\w{4,}\b/g) || [];
                        words.slice(0, 5).forEach(word => projectStats[proj].topics.add(word));
                    });
                    
                    const projects = Object.keys(projectStats).sort();
                    const currentProj = getCurrentProject();
                    
                    projectsText += `Total Projects: ${projects.length}\n`;
                    projectsText += `Current Project: ${currentProj}\n`;
                    projectsText += `Total Messages: ${allMsgs.length}\n\n`;
                    
                    projects.forEach(proj => {
                        const stats = projectStats[proj];
                        const isCurrent = proj === currentProj;
                        const marker = isCurrent ? '👉 ' : '   ';
                        
                        projectsText += `${marker}${proj}\n`;
                        
                        if (showDetails) {
                            projectsText += `     Messages: ${stats.total} (Kiro: ${stats.fromKiro}, Q: ${stats.fromQ})\n`;
                            projectsText += `     Last Activity: ${stats.lastActivity.toLocaleString()}\n`;
                            
                            const topicList = Array.from(stats.topics).slice(0, 5).join(', ');
                            if (topicList) {
                                projectsText += `     Topics: ${topicList}\n`;
                            }
                        }
                        projectsText += '\n';
                    });
                    
                    projectsText += `💡 Use get_related_messages to find messages across projects\n`;
                    projectsText += `💡 Use kiro_status with filter_project to view specific project messages\n`;
                    
                } catch (e) {
                    projectsText += `⚠️ Error reading messages: ${e.message}\n`;
                }
            } else {
                projectsText += '❌ No message file found\n';
            }
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: projectsText
                }]
            });
            
        default:
            return createResponse(id, null, {
                code: -32601,
                message: `Unknown tool: ${toolName}`
            });
    }
}

// Main server loop
function main() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: false
    });
    
    rl.on('line', (line) => {
        line = line.trim();
        if (!line) return;
        
        try {
            const request = JSON.parse(line);
            const response = handleRequest(request);
            console.log(JSON.stringify(response));
        } catch (error) {
            const errorResponse = createResponse(null, null, {
                code: -32700,
                message: `Parse error: ${error.message}`
            });
            console.log(JSON.stringify(errorResponse));
        }
    });
    
    rl.on('close', () => {
        process.exit(0);
    });
    
    // Handle process termination
    process.on('SIGINT', () => process.exit(0));
    process.on('SIGTERM', () => process.exit(0));
}

if (require.main === module) {
    main();
}

module.exports = { handleRequest, createResponse };