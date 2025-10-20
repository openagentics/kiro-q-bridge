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
                            description: 'Get Kiro-Q bridge status',
                            inputSchema: {
                                type: 'object',
                                properties: {},
                                required: []
                            }
                        },
                        {
                            name: 'send_to_q',
                            description: 'Send message to Amazon Q',
                            inputSchema: {
                                type: 'object',
                                properties: {
                                    message: { type: 'string', description: 'Message to send to Q' },
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

// Handle tool calls
function handleToolCall(id, params) {
    const { name: toolName, arguments: args = {} } = params;
    
    switch (toolName) {
        case 'kiro_status':
            const kiroDir = ensureKiroDir();
            const status = {
                timestamp: getTimestamp(),
                version: CONFIG.serverVersion,
                bridge_active: true,
                kiro_dir: kiroDir,
                message_file: CONFIG.messageFile,
                server_type: 'node-v4',
                current_project: getCurrentProject()
            };
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: `🟢 Kiro-Q Bridge v4 Status\n\n${JSON.stringify(status, null, 2)}`
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
                project: getCurrentProject(),
                from: 'Kiro',
                to: 'Amazon Q',
                message: message.trim(),
                priority,
                status: 'queued',
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
            
            return createResponse(id, {
                content: [{
                    type: 'text',
                    text: `✅ Message sent to Amazon Q\n\nID: ${messageData.id}\nMessage: ${message}\nPriority: ${priority}\nTimestamp: ${messageData.timestamp}`
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