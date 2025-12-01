#!/bin/bash
# Kiro-Q Bridge: Check Amazon Q Connection Status
# Helps detect when Q goes offline to prevent simulation

echo "🔍 Checking Amazon Q Connection Status..."
echo "========================================"

MESSAGES_FILE="$HOME/.kiro/q-messages.json"

if [ ! -f "$MESSAGES_FILE" ]; then
    echo "❌ No message file found at $MESSAGES_FILE"
    exit 1
fi

# Get last Q message timestamp
LAST_Q_MESSAGE=$(jq -r '.[] | select(.from == "Amazon Q") | .timestamp' "$MESSAGES_FILE" | tail -1)

if [ "$LAST_Q_MESSAGE" = "null" ] || [ -z "$LAST_Q_MESSAGE" ]; then
    echo "❌ No Amazon Q messages found"
    echo "🚨 Q Status: NEVER CONNECTED"
    exit 1
fi

# Convert to epoch for comparison
LAST_Q_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%S%z" "$LAST_Q_MESSAGE" "+%s" 2>/dev/null)
CURRENT_EPOCH=$(date "+%s")
HOURS_SINCE=$(( (CURRENT_EPOCH - LAST_Q_EPOCH) / 3600 ))

echo "📅 Last Q Message: $LAST_Q_MESSAGE"
echo "⏰ Hours Since Last Q Activity: $HOURS_SINCE"

if [ $HOURS_SINCE -lt 2 ]; then
    echo "✅ Q Status: ACTIVE (Recent activity)"
elif [ $HOURS_SINCE -lt 12 ]; then
    echo "⚠️  Q Status: POSSIBLY ACTIVE (Some delay)"
else
    echo "🚨 Q Status: LIKELY OFFLINE (No recent activity)"
    echo ""
    echo "⚠️  WARNING: Do not use respond_as_q=true when Q is offline!"
    echo "This would create simulated responses instead of real Q communication."
fi

echo ""
echo "🔒 Anti-Simulation Protection: ACTIVE"
echo "✅ Bridge will block respond_as_q when Q is offline"