#!/usr/bin/env node
/**
 * Kiro-Q Bridge v4.3 Enhanced Server
 * Adds HTTP API for true bidirectional communication alongside MCP
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const http = require('http');
const url = require('url');

// Configuration
const CONFIG = {
    protocolVersion: '2024-11-05',
    serverName: 'kiro-q-bridge-v4-enhanced',
    serverVersion: '4.3.0',
    messageFile: path.join(os.homedir(), '.kiro', 'q-messages.json'),
    httpPort: 3847, // KIRO in phone keypad
    maxMessages: 100
};

// Ensure message file exists
function ensureMessageFile() {
    const dir = path.dirname(CONFIG.messageFile);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(CONFIG.messageFile)) {
        fs.writeFileSync(CONFIG.messageFile, '[]');
    }
}

// Get timestamp in Eastern time
function getTimestamp() {
    const now = new Date();
    return now.toISOString().split('.')[0] + '-05:00';
}

// Load messages from file
function loadMessages() {
    try {
        const data = fs.readFileSync(CONFIG.messageFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Save messages to file
function saveMessages(messages) {
    // Keep only last 100 messages
    if (messages.length > CONFIG.maxMessages) {
        messages = messages.slice(-CONFIG.maxMessages);
    }
    fs.writeFileSync(CONFIG.messageFile, JSON.stringify(messages, null, 2));
    return messages;
}

// HTTP API Server for Amazon Q to connect
function createHttpServer() {
    const server = http.createServer((req, res) => {
        const parsedUrl = url.parse(req.url, true);
        const method = req.method;
        const pathname = parsedUrl.pathname;

        // CORS headers for browser access
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        try {
            if (pathname === '/api/messages' && method === 'GET') {
                // Get messages for Amazon Q to read
                const messages = loadMessages();
                const pendingForQ = messages.filter(msg => 
                    msg.from === 'Kiro' && 
                    msg.to === 'Amazon Q' && 
                    msg.status === 'queued'
                );
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    pending_messages: pendingForQ,
                    total_messages: messages.length,
                    timestamp: getTimestamp()
                }));

            } else if (pathname === '/api/respond' && method === 'POST') {
                // Amazon Q sends response
                let body = '';
                req.on('data', chunk => body += chunk);
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        const { message, reply_to, priority = 'normal' } = data;

                        if (!message || !message.trim()) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ success: false, error: 'Message required' }));
                            return;
                        }

                        const messages = loadMessages();
                        
                        // Create Q response message
                        const responseMessage = {
                            id: `amazon-q-v4-${Date.now()}`,
                            timestamp: getTimestamp(),
                            from: 'Amazon Q',
                            to: 'Kiro',
                            message: message.trim(),
                            priority,
                            reply_to: reply_to || null,
                            status: 'delivered',
                            version: 'v4',
                            source: 'http_api'
                        };

                        messages.push(responseMessage);
                        
                        // Mark replied-to message as responded
                        if (reply_to) {
                            const originalMsg = messages.find(m => m.id === reply_to);
                            if (originalMsg) {
                                originalMsg.status = 'responded';
                            }
                        }

                        saveMessages(messages);

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message_id: responseMessage.id,
                            timestamp: responseMessage.timestamp
                        }));

                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: false, error: error.message }));
                    }
                });

            } else if (pathname === '/api/status' && method === 'GET') {
                // Bridge status for Amazon Q
                const messages = loadMessages();
                const pendingCount = messages.filter(msg => 
                    msg.from === 'Kiro' && msg.status === 'queued'
                ).length;

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    bridge_active: true,
                    version: CONFIG.serverVersion,
                    pending_messages: pendingCount,
                    total_messages: messages.length,
                    message_file: CONFIG.messageFile,
                    timestamp: getTimestamp()
                }));

            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'Endpoint not found' }));
            }

        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: error.message }));
        }
    });

    server.listen(CONFIG.httpPort, () => {
        console.error(`[HTTP API] Bridge HTTP server listening on port ${CONFIG.httpPort}`);
        console.error(`[HTTP API] Amazon Q can connect to: http://localhost:${CONFIG.httpPort}/api/`);
    });

    return server;
}

// Original MCP Server Functions (unchanged)
function createResponse(id, result = null, error = null) {
    const response = { jsonrpc: '2.0', id };
    if (error) {
        response.error = error;
    } else {
        response.result = result;
    }
    return response;
}

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
                            description: 'Get bridge status and recent conversation history',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    show_messages: { type: 'boolean', default: true },
                                    message_count: { type: 'number', default: 5 }
                                },
                                required: []
                            }
                        },
                        {
                            name: 'send_to_q',
                            description: 'Send message to Amazon Q through the bridge',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', description: 'Message content' },
                                    priority: { type: 'string', enum: ['low', 'normal', 'high'], default: 'normal' }
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

function handleToolCall(id, params) {
    const { name: toolName, arguments: args = {} } = params;
    
    switch (toolName) {
        case 'kiro_status':
            const showMessages = args.show_messages !== false;
            const messageCount = Math.max(1, Math.min(50, args.message_count || 5));
            
            const allMessages = loadMessages();
            const pendingForQ = allMessages.filter(msg => 
                msg.from === 'Kiro' && 
                msg.to === 'Amazon Q' && 
                msg.status === 'queued'
            );

            let statusText = `🟢 Kiro-Q Bridge v4.3 Enhanced\n\n`;
            statusText += `Bridge Status: Active\n`;
            statusText += `HTTP API: Running on port ${CONFIG.httpPort}\n`;
            statusText += `Message File: ${CONFIG.messageFile}\n`;
            statusText += `Total Messages: ${allMessages.length}\n`;
            statusText += `Pending for Q: ${pendingForQ.length}\n`;
            statusText += `Timestamp: ${getTimestamp()}\n`;

            if (showMessages && allMessages.length > 0) {
                const recentMessages = allMessages.slice(-messageCount);
                statusText += '\n📝 Recent Conversation History:\n';
                recentMessages.forEach(msg => {
                    const time = new Date(msg.timestamp).toLocaleTimeString();
                    const preview = msg.message.length > 100 ? 
                        msg.message.substring(0, 100) + '...' : msg.message;
                    statusText += `\n[${time}] ${msg.from} → ${msg.to}:\n${preview}\n`;
                });
            }

            if (pendingForQ.length > 0) {
                statusText += `\n🔔 ${pendingForQ.length} message(s) awaiting Amazon Q response:\n`;
                statusText += `💡 Amazon Q can connect to: http://localhost:${CONFIG.httpPort}/api/messages\n`;
            }

            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: statusText
                }]
            });
            
        case 'send_to_q':
            const message = args.message || '';
            const priority = args.priority || 'normal';
            
            if (!message.trim()) {
                return createResponse(id, null, {
                    code: -32602,
                    message: 'Message cannot be empty'
                });
            }

            const messageData = {
                id: `kiro-v4-${Date.now()}`,
                timestamp: getTimestamp(),
                from: 'Kiro',
                to: 'Amazon Q',
                message: message.trim(),
                priority,
                status: 'queued',
                version: 'v4'
            };
            
            const currentMessages = loadMessages();
            currentMessages.push(messageData);
            saveMessages(currentMessages);
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: `✅ Message sent to Amazon Q\n\nID: ${messageData.id}\nMessage: ${message}\nPriority: ${priority}\nTimestamp: ${messageData.timestamp}\n\n💡 Amazon Q can retrieve this message via HTTP API at:\nhttp://localhost:${CONFIG.httpPort}/api/messages`
                }]
            });
            
        default:
            return createResponse(id, null, {
                code: -32601,
                message: `Unknown tool: ${toolName}`
            });
    }
}

// Main server
function main() {
    ensureMessageFile();
    
    // Start HTTP API server
    const httpServer = createHttpServer();
    
    // Start MCP server (stdin/stdout)
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
        httpServer.close();
        process.exit(0);
    });
    
    process.on('SIGINT', () => {
        httpServer.close();
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        httpServer.close();
        process.exit(0);
    });
}

if (require.main === module) {
    main();
}

module.exports = { handleRequest, createResponse };