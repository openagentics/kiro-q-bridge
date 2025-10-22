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
    messageFile: path.join(os.homedir(), '.kiro', 'q-messages.json')
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

// Ensure ~/.kiro directory exists
function ensureKiroDir() {
    const kiroDir = path.dirname(CONFIG.messageFile);
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
                                    respond_as_q: { type: 'boolean', default: false, description: 'If Q needs to respond, do it automatically in this call' },
                                    q_response_message: { type: 'string', description: 'Message for Q to send (when respond_as_q=true)' }
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
            
            // Enhanced input validation for kiro_status
            if (messageCount < 1 || messageCount > 50) {
                messageCount = Math.max(1, Math.min(50, messageCount));
            }
            
            if (respondAsQ && !qResponseMessage.trim()) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'When respond_as_q=true, q_response_message is required and cannot be empty.'
                });
            }
            
            if (qResponseMessage.length > 5000) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Q response message too long. Maximum length is 5,000 characters.'
                });
            }
            
            const status = {
                timestamp: getTimestamp(),
                version: CONFIG.serverVersion,
                bridge_active: true,
                kiro_dir: kiroDir,
                message_file: CONFIG.messageFile,
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
            
            // Auto-respond as Q if requested and there are pending messages
            if (respondAsQ && pendingMessages.length > 0 && qResponseMessage) {
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
                    version: 'v4'
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
            
            // Add conversation history if requested
            if (showMessages && allMessages.length > 0) {
                const recentMessages = allMessages.slice(-messageCount);
                statusText += '\n\n📝 Recent Conversation History:\n';
                recentMessages.forEach(msg => {
                    const time = new Date(msg.timestamp).toLocaleTimeString();
                    const preview = msg.message.length > 100 ? 
                        msg.message.substring(0, 100) + '...' : msg.message;
                    statusText += `\n[${time}] ${msg.from} → ${msg.to}:\n${preview}\n`;
                });
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
                    statusText += '\n🤖 AUTO-RESPOND MODE: Use respond_as_q=true with q_response_message to respond in next call!\n';
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
            ensureKiroDir();
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