#!/bin/bash
# Link Kiro-Q messages to current project
# Run this in any project to see the message history

MESSAGES_FILE="$HOME/.kiro/q-messages.json"
LOCAL_LINK="kiro-q-messages.json"

if [ -f "$MESSAGES_FILE" ]; then
    if [ -L "$LOCAL_LINK" ]; then
        echo "✅ Message link already exists"
    else
        ln -s "$MESSAGES_FILE" "$LOCAL_LINK"
        echo "✅ Created symbolic link to Kiro-Q messages"
        echo "📁 You can now see messages in: $LOCAL_LINK"
    fi
else
    echo "❌ Kiro messages file not found at: $MESSAGES_FILE"
    echo "💡 Send a test message first to create the file"
fi