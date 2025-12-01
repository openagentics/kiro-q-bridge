#!/bin/bash
# Kiro-Q Bridge - Message Viewer
# View messages across all projects or filter by specific project

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Message file locations
GLOBAL_MESSAGES="$HOME/.kiro/q-messages.json"
WORKSPACE_MESSAGES=".kiro-q-messages.json"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is not installed${NC}"
    echo "Install with: brew install jq (macOS) or apt-get install jq (Linux)"
    exit 1
fi

# Determine which message file to use
MESSAGE_FILE=""
if [ -f "$WORKSPACE_MESSAGES" ]; then
    MESSAGE_FILE="$WORKSPACE_MESSAGES"
    echo -e "${BLUE}📁 Using workspace messages: $WORKSPACE_MESSAGES${NC}"
elif [ -f "$GLOBAL_MESSAGES" ]; then
    MESSAGE_FILE="$GLOBAL_MESSAGES"
    echo -e "${BLUE}📁 Using global messages: $GLOBAL_MESSAGES${NC}"
else
    echo -e "${RED}❌ No message file found${NC}"
    echo "Checked:"
    echo "  - $WORKSPACE_MESSAGES"
    echo "  - $GLOBAL_MESSAGES"
    exit 1
fi

# Get filter parameters
PROJECT_FILTER="${1:-all}"
FORMAT="${2:-pretty}"

echo -e "${GREEN}🔍 Kiro-Q Bridge Message Viewer${NC}"
echo ""

# Function to format a single message
format_message() {
    local msg="$1"
    local timestamp=$(echo "$msg" | jq -r '.timestamp')
    local from=$(echo "$msg" | jq -r '.from')
    local to=$(echo "$msg" | jq -r '.to')
    local project=$(echo "$msg" | jq -r '.project // "unknown"')
    local message=$(echo "$msg" | jq -r '.message')
    local priority=$(echo "$msg" | jq -r '.priority // "normal"')
    local id=$(echo "$msg" | jq -r '.id // "no-id"')
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📨 Message ID:${NC} $id"
    echo -e "${BLUE}⏰ Time:${NC} $timestamp"
    echo -e "${BLUE}📂 Project:${NC} $project"
    echo -e "${BLUE}👤 From:${NC} $from ${BLUE}→ To:${NC} $to"
    echo -e "${BLUE}⚡ Priority:${NC} $priority"
    echo ""
    echo -e "${GREEN}Message:${NC}"
    echo "$message" | head -20
    if [ $(echo "$message" | wc -l) -gt 20 ]; then
        echo -e "${YELLOW}... (message truncated, $(echo "$message" | wc -l) total lines)${NC}"
    fi
    echo ""
}

# Filter and display messages
if [ "$PROJECT_FILTER" = "all" ]; then
    echo -e "${GREEN}Showing all messages from all projects${NC}"
    echo ""
    
    if [ "$FORMAT" = "json" ]; then
        cat "$MESSAGE_FILE" | jq .
    else
        # Count messages
        TOTAL=$(cat "$MESSAGE_FILE" | jq 'length')
        echo -e "${BLUE}Total messages: $TOTAL${NC}"
        echo ""
        
        # Show each message
        cat "$MESSAGE_FILE" | jq -c '.[]' | while read -r msg; do
            format_message "$msg"
        done
    fi
else
    echo -e "${GREEN}Filtering messages for project: ${YELLOW}$PROJECT_FILTER${NC}"
    echo ""
    
    if [ "$FORMAT" = "json" ]; then
        cat "$MESSAGE_FILE" | jq "[.[] | select(.project == \"$PROJECT_FILTER\")]"
    else
        # Count filtered messages
        TOTAL=$(cat "$MESSAGE_FILE" | jq "[.[] | select(.project == \"$PROJECT_FILTER\")] | length")
        echo -e "${BLUE}Messages for project '$PROJECT_FILTER': $TOTAL${NC}"
        echo ""
        
        if [ "$TOTAL" -eq 0 ]; then
            echo -e "${YELLOW}No messages found for project '$PROJECT_FILTER'${NC}"
            echo ""
            echo "Available projects:"
            cat "$MESSAGE_FILE" | jq -r '.[].project // "unknown"' | sort -u | while read -r proj; do
                echo "  - $proj"
            done
        else
            # Show filtered messages
            cat "$MESSAGE_FILE" | jq -c ".[] | select(.project == \"$PROJECT_FILTER\")" | while read -r msg; do
                format_message "$msg"
            done
        fi
    fi
fi

echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}Usage:${NC}"
echo "  ./view-messages.sh              # View all messages"
echo "  ./view-messages.sh <project>    # View messages for specific project"
echo "  ./view-messages.sh all json     # View all messages as JSON"
echo "  ./view-messages.sh <project> json  # View project messages as JSON"
