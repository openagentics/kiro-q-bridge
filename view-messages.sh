#!/bin/bash
# Kiro-Q Bridge v4 - Message Viewer Utility
# View formatted conversation history from ~/.kiro/q-messages.json

MESSAGE_FILE="$HOME/.kiro/q-messages.json"
PROJECT_FILTER=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -p|--project)
            PROJECT_FILTER="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS] [PROJECT_NAME]"
            echo ""
            echo "View Kiro-Q Bridge conversation history"
            echo ""
            echo "OPTIONS:"
            echo "  -p, --project PROJECT    Filter messages by project name"
            echo "  -h, --help              Show this help message"
            echo ""
            echo "EXAMPLES:"
            echo "  $0                      # View all messages"
            echo "  $0 my-project          # View messages for 'my-project'"
            echo "  $0 -p my-project       # Same as above"
            exit 0
            ;;
        *)
            PROJECT_FILTER="$1"
            shift
            ;;
    esac
done

# Check if message file exists
if [[ ! -f "$MESSAGE_FILE" ]]; then
    echo "❌ No message history found at $MESSAGE_FILE"
    echo "💡 Send a message using the Kiro-Q Bridge to create the history file."
    exit 1
fi

# Check if jq is available for pretty formatting
if command -v jq >/dev/null 2>&1; then
    HAS_JQ=true
else
    HAS_JQ=false
    echo "💡 Install 'jq' for better formatting: brew install jq"
    echo ""
fi

echo "📝 Kiro-Q Bridge Message History"
echo "================================"
echo "📁 File: $MESSAGE_FILE"

if [[ -n "$PROJECT_FILTER" ]]; then
    echo "🎯 Project Filter: $PROJECT_FILTER"
fi

echo ""

# Read and display messages
if [[ "$HAS_JQ" == true ]]; then
    # Use jq for pretty formatting and filtering
    if [[ -n "$PROJECT_FILTER" ]]; then
        jq -r --arg project "$PROJECT_FILTER" '
            .[] | select(.project == $project) | 
            "[\(.timestamp | strftime("%m/%d %H:%M"))] \(.from) → \(.to) (\(.priority)):\n\(.message)\n" + 
            (if .reply_to then "↳ Reply to: \(.reply_to)\n" else "" end) + 
            "---"
        ' "$MESSAGE_FILE" 2>/dev/null || {
            echo "❌ Error reading message file or no messages found for project '$PROJECT_FILTER'"
            exit 1
        }
    else
        jq -r '
            .[] | 
            "[\(.timestamp | strftime("%m/%d %H:%M"))] \(.from) → \(.to) (\(.priority)) [\(.project)]:\n\(.message)\n" + 
            (if .reply_to then "↳ Reply to: \(.reply_to)\n" else "" end) + 
            "---"
        ' "$MESSAGE_FILE" 2>/dev/null || {
            echo "❌ Error reading message file"
            exit 1
        }
    fi
else
    # Fallback without jq - basic formatting
    if [[ -n "$PROJECT_FILTER" ]]; then
        echo "🔍 Filtering for project: $PROJECT_FILTER"
        echo "(Install 'jq' for better formatting and filtering)"
        echo ""
    fi
    
    # Simple cat output with basic formatting
    echo "📄 Raw JSON (install 'jq' for formatted view):"
    echo "=============================================="
    cat "$MESSAGE_FILE"
fi

echo ""
echo "💡 Tips:"
echo "  • Use 'jq' for better formatting: brew install jq"
echo "  • Link to current project: ./link-messages.sh"
echo "  • View in Kiro IDE: Cmd+P → ~/.kiro/q-messages.json"