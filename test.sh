#!/bin/bash
# Test script for Kiro-Q Bridge v4

echo "🧪 Testing Kiro-Q Bridge v4..."

SERVER_FILE="./mcp-server.js"

if [ ! -f "$SERVER_FILE" ]; then
    echo "❌ Server file not found: $SERVER_FILE"
    exit 1
fi

echo "📡 Testing MCP server initialization..."

# Test initialize request
INIT_REQUEST='{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}}}'

RESPONSE=$(echo "$INIT_REQUEST" | node "$SERVER_FILE")
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"protocolVersion":"2024-11-05"'; then
    echo "✅ Initialize test passed"
else
    echo "❌ Initialize test failed"
    exit 1
fi

echo "📋 Testing tools list..."

# Test tools/list request
TOOLS_REQUEST='{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}'

RESPONSE=$(echo "$TOOLS_REQUEST" | node "$SERVER_FILE")
echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"kiro_status"'; then
    echo "✅ Tools list test passed"
else
    echo "❌ Tools list test failed"
    exit 1
fi

echo "🎉 All tests passed! Server is working correctly."