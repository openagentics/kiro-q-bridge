#!/bin/bash
# Kiro-Q Bridge v4 Installer
# Clean, simple installation

set -e

echo "🚀 Installing Kiro-Q Bridge v4..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_FILE="$SCRIPT_DIR/mcp-server.js"

# Ensure the server file exists
if [ ! -f "$SERVER_FILE" ]; then
    echo "❌ Error: MCP server file not found at $SERVER_FILE"
    exit 1
fi

# Make server executable
chmod +x "$SERVER_FILE"

# Ensure ~/.kiro/settings directory exists
KIRO_SETTINGS_DIR="$HOME/.kiro/settings"
mkdir -p "$KIRO_SETTINGS_DIR"

# Create MCP configuration
MCP_CONFIG="$KIRO_SETTINGS_DIR/mcp.json"

echo "📝 Creating MCP configuration..."

cat > "$MCP_CONFIG" << EOF
{
  "mcpServers": {
    "kiro-q-bridge-v4": {
      "command": "node",
      "args": [
        "$SERVER_FILE"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "disabled": false,
      "autoApprove": [
        "kiro_status",
        "send_to_q"
      ]
    }
  }
}
EOF

echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart Kiro IDE"
echo "2. The MCP server will connect automatically"
echo "3. Test with: kiro_status or send_to_q"
echo ""
echo "Configuration saved to: $MCP_CONFIG"
echo "Server location: $SERVER_FILE"