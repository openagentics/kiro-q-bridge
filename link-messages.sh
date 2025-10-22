#!/bin/bash
# Kiro-Q Bridge v4 - Message Linker Utility
# Create symbolic link to global message history in current project

MESSAGE_FILE="$HOME/.kiro/q-messages.json"
LINK_NAME="kiro-q-messages.json"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--name)
            LINK_NAME="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Create symbolic link to Kiro-Q Bridge message history in current project"
            echo ""
            echo "OPTIONS:"
            echo "  -n, --name NAME         Custom name for the link (default: kiro-q-messages.json)"
            echo "  -f, --force            Overwrite existing file/link"
            echo "  -h, --help             Show this help message"
            echo ""
            echo "EXAMPLES:"
            echo "  $0                     # Create kiro-q-messages.json link"
            echo "  $0 -n messages.json    # Create messages.json link"
            echo "  $0 -f                  # Force overwrite existing file"
            exit 0
            ;;
        *)
            echo "❌ Unknown option: $1"
            echo "Use -h or --help for usage information"
            exit 1
            ;;
    esac
done

# Check if source message file exists
if [[ ! -f "$MESSAGE_FILE" ]]; then
    echo "❌ No message history found at $MESSAGE_FILE"
    echo "💡 Send a message using the Kiro-Q Bridge to create the history file."
    exit 1
fi

# Check if link already exists
if [[ -e "$LINK_NAME" ]]; then
    if [[ "$FORCE" == true ]]; then
        echo "🗑️  Removing existing file: $LINK_NAME"
        rm -f "$LINK_NAME"
    else
        echo "❌ File already exists: $LINK_NAME"
        echo "💡 Use -f or --force to overwrite, or choose a different name with -n"
        exit 1
    fi
fi

# Create symbolic link
if ln -s "$MESSAGE_FILE" "$LINK_NAME"; then
    echo "✅ Created symbolic link: $LINK_NAME → $MESSAGE_FILE"
    echo ""
    echo "📁 You can now access your Kiro-Q conversation history in this project:"
    echo "   • Open in Kiro IDE: $LINK_NAME"
    echo "   • View in terminal: cat $LINK_NAME"
    echo "   • Pretty format: jq . $LINK_NAME"
    echo ""
    echo "🔄 The link stays synchronized with your global message history."
    echo "💡 All changes to the global history will be reflected here automatically."
else
    echo "❌ Failed to create symbolic link"
    exit 1
fi

# Show current project context
CURRENT_PROJECT=$(basename "$(pwd)")
echo "🎯 Current Project: $CURRENT_PROJECT"

# Count messages for this project if jq is available
if command -v jq >/dev/null 2>&1; then
    PROJECT_COUNT=$(jq --arg project "$CURRENT_PROJECT" '[.[] | select(.project == $project)] | length' "$MESSAGE_FILE" 2>/dev/null)
    TOTAL_COUNT=$(jq 'length' "$MESSAGE_FILE" 2>/dev/null)
    
    if [[ -n "$PROJECT_COUNT" && -n "$TOTAL_COUNT" ]]; then
        echo "📊 Messages: $PROJECT_COUNT for this project, $TOTAL_COUNT total"
    fi
fi