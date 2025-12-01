#!/bin/bash
# Test script for Enhanced Kiro-Q Bridge v4.3

echo "🧪 Testing Enhanced Kiro-Q Bridge v4.3..."

# Check if enhanced server exists
if [ ! -f "./bridge-server-enhanced.js" ]; then
    echo "❌ Enhanced server file not found"
    exit 1
fi

# Check if client exists
if [ ! -f "./q-client.js" ]; then
    echo "❌ Q client file not found"
    exit 1
fi

echo "📡 Starting enhanced bridge server in background..."

# Start the enhanced server in background
node ./bridge-server-enhanced.js &
SERVER_PID=$!

# Give server time to start
sleep 2

echo "🔍 Testing HTTP API endpoints..."

# Test status endpoint
echo "Testing /api/status..."
STATUS_RESPONSE=$(curl -s http://localhost:3847/api/status)
if echo "$STATUS_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Status endpoint working"
else
    echo "❌ Status endpoint failed"
    echo "Response: $STATUS_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test messages endpoint
echo "Testing /api/messages..."
MESSAGES_RESPONSE=$(curl -s http://localhost:3847/api/messages)
if echo "$MESSAGES_RESPONSE" | grep -q '"success":true'; then
    echo "✅ Messages endpoint working"
else
    echo "❌ Messages endpoint failed"
    echo "Response: $MESSAGES_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test Q client
echo "🤖 Testing Amazon Q client..."
CLIENT_RESPONSE=$(node ./q-client.js status)
if echo "$CLIENT_RESPONSE" | grep -q '"bridge_active":true'; then
    echo "✅ Q client can connect to bridge"
else
    echo "❌ Q client connection failed"
    echo "Response: $CLIENT_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Test MCP functionality
echo "📋 Testing MCP server functionality..."
INIT_REQUEST='{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test", "version": "1.0"}}}'

MCP_RESPONSE=$(echo "$INIT_REQUEST" | node ./bridge-server-enhanced.js)
if echo "$MCP_RESPONSE" | grep -q '"protocolVersion":"2024-11-05"'; then
    echo "✅ MCP server working"
else
    echo "❌ MCP server failed"
    echo "Response: $MCP_RESPONSE"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

# Clean up
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo "🎉 All tests passed! Enhanced bridge is working correctly."
echo ""
echo "📋 Next Steps:"
echo "1. Replace mcp-server.js with bridge-server-enhanced.js"
echo "2. Update Kiro IDE configuration to use enhanced server"
echo "3. Amazon Q can now connect via: node q-client.js test"
echo "4. True bidirectional communication is now possible!"