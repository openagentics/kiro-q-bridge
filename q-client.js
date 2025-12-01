#!/usr/bin/env node
/**
 * Amazon Q Client for Kiro-Q Bridge
 * Allows Amazon Q to connect and respond to messages
 */

const http = require('http');

const BRIDGE_URL = 'http://localhost:3847';

// Make HTTP request
function makeRequest(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3847,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (error) {
                    reject(new Error(`Invalid JSON response: ${body}`));
                }
            });
        });

        req.on('error', (error) => {
            reject(new Error(`HTTP request failed: ${error.message}`));
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            reject(new Error('Request timeout'));
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

// Get pending messages for Amazon Q
async function getPendingMessages() {
    try {
        const response = await makeRequest('/api/messages');
        return response;
    } catch (error) {
        console.error('Error getting messages:', error.message);
        return null;
    }
}

// Send response as Amazon Q
async function sendResponse(message, replyTo = null, priority = 'normal') {
    try {
        const response = await makeRequest('/api/respond', 'POST', {
            message,
            reply_to: replyTo,
            priority
        });
        return response;
    } catch (error) {
        console.error('Error sending response:', error.message);
        return null;
    }
}

// Get bridge status
async function getBridgeStatus() {
    try {
        const response = await makeRequest('/api/status');
        return response;
    } catch (error) {
        console.error('Error getting status:', error.message);
        return null;
    }
}

// Main function for testing
async function main() {
    const command = process.argv[2];
    
    switch (command) {
        case 'status':
            const status = await getBridgeStatus();
            if (status) {
                console.log('Bridge Status:', JSON.stringify(status, null, 2));
            }
            break;
            
        case 'messages':
            const messages = await getPendingMessages();
            if (messages) {
                console.log('Pending Messages:', JSON.stringify(messages, null, 2));
            }
            break;
            
        case 'respond':
            const message = process.argv[3];
            const replyTo = process.argv[4];
            if (!message) {
                console.log('Usage: node q-client.js respond "Your message" [reply_to_id]');
                process.exit(1);
            }
            const result = await sendResponse(message, replyTo);
            if (result) {
                console.log('Response sent:', JSON.stringify(result, null, 2));
            }
            break;
            
        case 'test':
            // Test the connection and respond to latest message
            console.log('🧪 Testing Amazon Q Bridge Connection...\n');
            
            const testStatus = await getBridgeStatus();
            if (!testStatus) {
                console.log('❌ Bridge not accessible');
                process.exit(1);
            }
            console.log('✅ Bridge Status:', testStatus);
            
            const testMessages = await getPendingMessages();
            if (!testMessages) {
                console.log('❌ Cannot retrieve messages');
                process.exit(1);
            }
            console.log('✅ Messages Retrieved:', testMessages.pending_messages.length, 'pending');
            
            if (testMessages.pending_messages.length > 0) {
                const latestMessage = testMessages.pending_messages[testMessages.pending_messages.length - 1];
                console.log('\n📨 Latest Message from Kiro:');
                console.log('ID:', latestMessage.id);
                console.log('Message:', latestMessage.message.substring(0, 200) + '...');
                
                const testResponse = await sendResponse(
                    '✅ BRIDGE CONNECTION SUCCESSFUL! This is Amazon Q responding through the HTTP API. The enhanced bridge is working - I can now receive Kiro\'s messages and respond directly!',
                    latestMessage.id,
                    'high'
                );
                
                if (testResponse) {
                    console.log('✅ Response Sent Successfully:', testResponse.message_id);
                    console.log('\n🎉 Bridge test complete! Amazon Q can now communicate bidirectionally.');
                } else {
                    console.log('❌ Failed to send response');
                }
            } else {
                console.log('\n💡 No pending messages. Send a message from Kiro first.');
            }
            break;
            
        default:
            console.log('Amazon Q Bridge Client');
            console.log('Usage:');
            console.log('  node q-client.js status          - Get bridge status');
            console.log('  node q-client.js messages        - Get pending messages');
            console.log('  node q-client.js respond "msg"   - Send response');
            console.log('  node q-client.js test            - Test connection and respond');
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = { getPendingMessages, sendResponse, getBridgeStatus };