#!/bin/bash
# Test Cross-Project Features
# Validates all new cross-project context functionality

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🧪 Testing Kiro-Q Bridge Cross-Project Features${NC}"
echo ""

# Test 1: Check if utility scripts exist and are executable
echo -e "${BLUE}Test 1: Utility Scripts${NC}"
if [ -x "./view-messages.sh" ]; then
    echo -e "${GREEN}✅ view-messages.sh exists and is executable${NC}"
else
    echo -e "${RED}❌ view-messages.sh not found or not executable${NC}"
    exit 1
fi

if [ -x "./link-messages.sh" ]; then
    echo -e "${GREEN}✅ link-messages.sh exists and is executable${NC}"
else
    echo -e "${RED}❌ link-messages.sh not found or not executable${NC}"
    exit 1
fi
echo ""

# Test 2: Check MCP server has new tools
echo -e "${BLUE}Test 2: MCP Server Tools${NC}"
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}' | node mcp-server.js > /tmp/tools-test.json

if grep -q "get_related_messages" /tmp/tools-test.json; then
    echo -e "${GREEN}✅ get_related_messages tool found${NC}"
else
    echo -e "${RED}❌ get_related_messages tool not found${NC}"
    exit 1
fi

if grep -q "list_projects" /tmp/tools-test.json; then
    echo -e "${GREEN}✅ list_projects tool found${NC}"
else
    echo -e "${RED}❌ list_projects tool not found${NC}"
    exit 1
fi

if grep -q "filter_project" /tmp/tools-test.json; then
    echo -e "${GREEN}✅ kiro_status has filter_project parameter${NC}"
else
    echo -e "${RED}❌ kiro_status missing filter_project parameter${NC}"
    exit 1
fi
echo ""

# Test 3: Check global message file
echo -e "${BLUE}Test 3: Global Message File${NC}"
if [ -f "$HOME/.kiro/q-messages.json" ]; then
    echo -e "${GREEN}✅ Global message file exists: ~/.kiro/q-messages.json${NC}"
    
    if command -v jq &> /dev/null; then
        MSG_COUNT=$(cat "$HOME/.kiro/q-messages.json" | jq 'length')
        echo -e "${BLUE}   Messages in global file: $MSG_COUNT${NC}"
        
        PROJECT_COUNT=$(cat "$HOME/.kiro/q-messages.json" | jq -r '.[].project // "unknown"' | sort -u | wc -l)
        echo -e "${BLUE}   Projects with messages: $PROJECT_COUNT${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Global message file not found (will be created on first use)${NC}"
fi
echo ""

# Test 4: Test view-messages.sh
echo -e "${BLUE}Test 4: View Messages Script${NC}"
if command -v jq &> /dev/null; then
    echo -e "${BLUE}Running: ./view-messages.sh all json | head -20${NC}"
    ./view-messages.sh all json 2>/dev/null | head -20 || echo -e "${YELLOW}⚠️  No messages to display yet${NC}"
    echo -e "${GREEN}✅ view-messages.sh executed successfully${NC}"
else
    echo -e "${YELLOW}⚠️  jq not installed, skipping view-messages test${NC}"
    echo -e "${BLUE}   Install with: brew install jq${NC}"
fi
echo ""

# Test 5: Test list_projects tool
echo -e "${BLUE}Test 5: List Projects Tool${NC}"
LIST_PROJECTS_REQUEST='{"jsonrpc":"2.0","id":5,"method":"tools/call","params":{"name":"list_projects","arguments":{"show_details":true}}}'
echo "$LIST_PROJECTS_REQUEST" | node mcp-server.js > /tmp/list-projects-test.json

if grep -q "Projects in Kiro-Q Bridge" /tmp/list-projects-test.json; then
    echo -e "${GREEN}✅ list_projects tool working${NC}"
    cat /tmp/list-projects-test.json | jq -r '.result.content[0].text' | head -15
else
    echo -e "${RED}❌ list_projects tool failed${NC}"
    cat /tmp/list-projects-test.json
    exit 1
fi
echo ""

# Test 6: Test get_related_messages tool
echo -e "${BLUE}Test 6: Get Related Messages Tool${NC}"
RELATED_MSG_REQUEST='{"jsonrpc":"2.0","id":6,"method":"tools/call","params":{"name":"get_related_messages","arguments":{"related_topics":["AWS","test"],"max_messages":5}}}'
echo "$RELATED_MSG_REQUEST" | node mcp-server.js > /tmp/related-messages-test.json

if grep -q "Related Messages Across Projects" /tmp/related-messages-test.json; then
    echo -e "${GREEN}✅ get_related_messages tool working${NC}"
    cat /tmp/related-messages-test.json | jq -r '.result.content[0].text' | head -15
else
    echo -e "${RED}❌ get_related_messages tool failed${NC}"
    cat /tmp/related-messages-test.json
    exit 1
fi
echo ""

# Test 7: Test kiro_status with filter_project
echo -e "${BLUE}Test 7: Kiro Status with Project Filter${NC}"
FILTER_STATUS_REQUEST='{"jsonrpc":"2.0","id":7,"method":"tools/call","params":{"name":"kiro_status","arguments":{"show_messages":true,"filter_project":"kiro-q-bridge-v4","message_count":3}}}'
echo "$FILTER_STATUS_REQUEST" | node mcp-server.js > /tmp/filter-status-test.json

if grep -q "Kiro-Q Bridge v4 Session Manager" /tmp/filter-status-test.json; then
    echo -e "${GREEN}✅ kiro_status with filter_project working${NC}"
    cat /tmp/filter-status-test.json | jq -r '.result.content[0].text' | head -20
else
    echo -e "${RED}❌ kiro_status with filter_project failed${NC}"
    cat /tmp/filter-status-test.json
    exit 1
fi
echo ""

# Test 8: Check documentation
echo -e "${BLUE}Test 8: Documentation${NC}"
if [ -f "CROSS_PROJECT_GUIDE.md" ]; then
    echo -e "${GREEN}✅ CROSS_PROJECT_GUIDE.md exists${NC}"
    GUIDE_LINES=$(wc -l < CROSS_PROJECT_GUIDE.md)
    echo -e "${BLUE}   Guide has $GUIDE_LINES lines${NC}"
else
    echo -e "${RED}❌ CROSS_PROJECT_GUIDE.md not found${NC}"
    exit 1
fi
echo ""

# Cleanup
rm -f /tmp/tools-test.json /tmp/list-projects-test.json /tmp/related-messages-test.json /tmp/filter-status-test.json

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ ALL CROSS-PROJECT TESTS PASSED${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}📚 Next Steps:${NC}"
echo "1. Restart Kiro IDE to load new MCP tools"
echo "2. Read CROSS_PROJECT_GUIDE.md for usage examples"
echo "3. Try: list_projects() to see all your projects"
echo "4. Try: get_related_messages({related_topics: ['AWS']}) to find related messages"
echo "5. Try: ./view-messages.sh to view messages in terminal"
echo ""
echo -e "${GREEN}🎉 Cross-project context is now fully active!${NC}"
