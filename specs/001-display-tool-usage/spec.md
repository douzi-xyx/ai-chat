# Feature Specification: Display Tool Usage in AI Messages

**Feature Branch**: `001-display-tool-usage`  
**Created**: 2025-01-27  
**Status**: Draft  
**Input**: User description: "目前现有的功能中已经实现了用户与ai之间的对话，并且用户可以在对话之前选择一些工具，或者是ai基于用户的内容使用了大模型绑定的工具或者mcp工具，如果大模型调用了工具，那么在渲染对话列表的时候，需要在ai对话内容的最顶部展示出来当前大模型使用了哪些工具"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Tools Used by AI (Priority: P1)

When AI uses tools (either user-selected tools or automatically invoked tools including MCP tools) to answer a user's question, users can see which tools were used at the top of the AI's response message. This helps users understand how the AI arrived at its answer and provides transparency into the AI's reasoning process.

**Why this priority**: This is the core functionality - displaying tool usage information. Without this, users cannot see which tools were invoked, making it impossible to understand the AI's tool usage behavior.

**Independent Test**: Can be fully tested by sending a message that triggers tool usage, then verifying that the tool names are displayed at the top of the AI's response message before the actual content.

**Acceptance Scenarios**:

1. **Given** a user sends a message that causes AI to use a tool (e.g., "What's the weather in Shanghai?"), **When** the AI response is displayed, **Then** the tool name (e.g., "weather") is shown at the top of the AI message before the response content
2. **Given** a user sends a message that causes AI to use multiple tools, **When** the AI response is displayed, **Then** all tool names are shown at the top of the AI message in a clear, readable format
3. **Given** a user sends a message that does not trigger any tool usage, **When** the AI response is displayed, **Then** no tool usage indicator is shown (only the normal message content)
4. **Given** AI uses both user-selected tools and automatically invoked MCP tools, **When** the AI response is displayed, **Then** all tools (both types) are shown in the tool usage display

### Edge Cases

- What happens when AI uses a tool but the tool execution fails? (Tool should still be displayed as it was attempted)
- How does system handle tool names that are very long? (Should truncate or wrap appropriately)
- What happens when AI uses the same tool multiple times in one response? (Should show tool once or indicate multiple uses)
- How does system handle tools with no display name or unknown tool identifiers? (Should show a fallback identifier)
- What happens during streaming when tools are being used? (Should display tools as soon as they are detected, before content streams)

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display tool usage information at the top of AI assistant messages when tools are used
- **FR-002**: System MUST display all tools used in a single AI response, including user-selected tools, automatically invoked tools, and MCP tools
- **FR-003**: System MUST NOT display tool usage information when no tools are used in an AI response
- **FR-004**: System MUST display tool names in a clear, readable format that distinguishes them from the main message content
- **FR-005**: System MUST handle cases where tool information is not available or tool names are missing
- **FR-006**: System MUST display tool usage information in real-time during streaming responses when tools are detected

### Technical Requirements

- **TR-001**: All frontend UI components MUST use Tailwind CSS for styling
- **TR-002**: All frontend UI components MUST use Material-UI (MUI) component library
- **TR-003**: All code MUST use TypeScript with strict type checking enabled
- **TR-004**: Tool usage display component MUST be accessible and follow WCAG guidelines

### Key Entities _(include if feature involves data)_

- **Tool Usage Information**: Represents which tools were invoked during an AI response. Contains: tool name/identifier, tool type (user-selected, auto-invoked, MCP), optional execution status
- **AI Message**: Contains the message content and associated tool usage information. Tool usage is displayed before the main content.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can identify which tools were used in 100% of AI responses that involve tool usage
- **SC-002**: Tool usage information is displayed within 1 second of tool invocation detection during streaming responses
- **SC-003**: Tool usage display does not interfere with reading the main message content (user satisfaction: 90%+ find it helpful and non-intrusive)
- **SC-004**: System correctly displays tool usage for all tool types (user-selected, auto-invoked, MCP) with 100% accuracy
