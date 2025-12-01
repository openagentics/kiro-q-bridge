#!/bin/bash
# Kiro-Q Bridge - Message Linker
# Create symbolic link from global messages to current workspace

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

GLOBAL_MESSAGES="$HOME/.kiro/q-messages.json"
WORKSPACE_LINK=".kiro-q-messages.json"

echo -e "${GREEN}🔗 Kiro-Q Bridge Message Linker${NC}"
echo ""

# Check if global message file exists
if [ ! -f "$GLOBAL_MESSAGES" ]; then
    echo -e "${RED}❌ Global message file not found: $GLOBAL_MESSAGES${NC}"
    echo ""
    echo "Creating empty global message file..."
    mkdir -p "$(dirname "$GLOBAL_MESSAGES")"
    echo "[]" > "$GLOBAL_MESSAGES"
    echo -e "${GREEN}✅ Created: $GLOBAL_MESSAGES${NC}"
fi

# Check if workspace link already exists
if [ -L "$WORKSPACE_LINK" ]; then
    echo -e "${YELLOW}⚠️  Symbolic link already exists: $WORKSPACE_LINK${NC}"
    echo ""
    echo "Current link target:"
    ls -l "$WORKSPACE_LINK"
    echo ""
    read -p "Replace existing link? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Keeping existing link${NC}"
        exit 0
    fi
    rm "$WORKSPACE_LINK"
elif [ -f "$WORKSPACE_LINK" ]; then
    echo -e "${YELLOW}⚠️  Regular file exists: $WORKSPACE_LINK${NC}"
    echo ""
    echo "This will be replaced with a symbolic link to the global message file."
    echo "The existing file will be backed up."
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}Cancelled${NC}"
        exit 0
    fi
    
    # Backup existing file
    BACKUP="${WORKSPACE_LINK}.backup.$(date +%Y%m%d-%H%M%S)"
    mv "$WORKSPACE_LINK" "$BACKUP"
    echo -e "${GREEN}✅ Backed up to: $BACKUP${NC}"
fi

# Create symbolic link
ln -s "$GLOBAL_MESSAGES" "$WORKSPACE_LINK"

echo -e "${GREEN}✅ Created symbolic link${NC}"
echo ""
echo -e "${BLUE}Link details:${NC}"
ls -lh "$WORKSPACE_LINK"
echo ""
echo -e "${BLUE}Global file:${NC} $GLOBAL_MESSAGES"
echo -e "${BLUE}Workspace link:${NC} $WORKSPACE_LINK"
echo ""

# Show message count
if command -v jq &> /dev/null; then
    MESSAGE_COUNT=$(cat "$GLOBAL_MESSAGES" | jq 'length')
    echo -e "${GREEN}📊 Total messages in global file: $MESSAGE_COUNT${NC}"
    
    # Show projects
    echo ""
    echo -e "${BLUE}Projects with messages:${NC}"
    cat "$GLOBAL_MESSAGES" | jq -r '.[].project // "unknown"' | sort -u | while read -r proj; do
        COUNT=$(cat "$GLOBAL_MESSAGES" | jq "[.[] | select(.project == \"$proj\")] | length")
        echo "  - $proj ($COUNT messages)"
    done
fi

echo ""
echo -e "${GREEN}✅ Workspace is now linked to global message history${NC}"
echo -e "${BLUE}All projects will share the same message file${NC}"
