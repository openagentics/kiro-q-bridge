#!/usr/bin/env node
/**
 * Helper script for Amazon Q to respond through the bridge
 * Usage: node q-response-helper.js "Your message here"
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

function getTimestamp() {
    const now = new Date();
    const eastern = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    return eastern.toISOString().split('.')[0] + '-05:00';
}

function getCurrentProject() {
    try {
        const cwd = process.cwd();
        return path.basename(cwd) || 'unknown-project';
    } catch (error) {
        return 'unknown-project';
    }
}

const message = process.argv[2];
if (!message) {
    console.error('Usage: node q-response-helper.js "Your message here"');
    process.exit(1);
}

const messageFile = path.join(process.cwd(), '.kiro-q-messages.json');
const fallbackFile = path.join(os.homedir(), '.kiro', 'q-messages.json');

// Try to read existing messages
let messages = [];
const fileToUse = fs.existsSync(messageFile) ? messageFile : fallbackFile;

if (fs.existsSync(fileToUse)) {
    try {
        const data = fs.readFileSync(fileToUse, 'utf8');
        messages = JSON.parse(data);
    } catch (e) {
        console.error('Error reading messages:', e.message);
        messages = [];
    }
}

// Find the latest pending Kiro message
const pendingKiroMessages = messages.filter(msg => 
    msg.from === 'Kiro' && 
    msg.to === 'Amazon Q' && 
    msg.status === 'queued'
);

const latestPending = pendingKiroMessages[pendingKiroMessages.length - 1];

// Create Q response
const qResponse = {
    id: `amazon-q-v4-${Date.now()}`,
    timestamp: getTimestamp(),
    project: getCurrentProject(),
    from: 'Amazon Q',
    to: 'Kiro',
    message: message.trim(),
    priority: 'normal',
    reply_to: latestPending ? latestPending.id : null,
    status: 'delivered',
    version: 'v4',
    verified_q_response: true
};

messages.push(qResponse);

// Keep only last 100 messages
if (messages.length > 100) {
    messages = messages.slice(-100);
}

// Write back to both files
try {
    fs.writeFileSync(messageFile, JSON.stringify(messages, null, 2));
    console.log(`✅ Amazon Q response sent successfully!`);
    console.log(`ID: ${qResponse.id}`);
    console.log(`Reply to: ${qResponse.reply_to || 'N/A'}`);
    console.log(`Message: ${message}`);
} catch (error) {
    console.error('Error writing response:', error.message);
    process.exit(1);
}