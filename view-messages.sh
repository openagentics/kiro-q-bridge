#!/bin/bash
# View Kiro-Q messages with project filtering
# Usage: ./view-messages.sh [project-name]

MESSAGES_FILE="$HOME/.kiro/q-messages.json"

if [ ! -f "$MESSAGES_FILE" ]; then
    echo "❌ No messages file found at: $MESSAGES_FILE"
    echo "💡 Send a test message first to create the file"
    exit 1
fi

if [ $# -eq 0 ]; then
    echo "📋 All Kiro-Q Messages:"
    echo "======================"
    jq -r '.[] | "[\(.timestamp)] [\(.project // "no-project")] \(.from): \(.message[0:100])..."' "$MESSAGES_FILE" 2>/dev/null || cat "$MESSAGES_FILE"
else
    PROJECT_FILTER="$1"
    echo "📋 Messages for project: $PROJECT_FILTER"
    echo "======================================="
    jq -r --arg project "$PROJECT_FILTER" '.[] | select(.project == $project) | "[\(.timestamp)] \(.from): \(.message[0:100])..."' "$MESSAGES_FILE" 2>/dev/null || echo "No messages found for project: $PROJECT_FILTER"
fi

echo ""
echo "💡 Usage:"
echo "  ./view-messages.sh                    # View all messages"
echo "  ./view-messages.sh kiro-q-bridge-v4  # View messages for specific project"