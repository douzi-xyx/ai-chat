# Data Model: Display Tool Usage in AI Messages

**Feature**: Display Tool Usage in AI Messages  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Entities

### Message

**Purpose**: Represents a single message in a conversation, now extended to include tool usage information.

**Fields**:

- `id: string` - Unique message identifier (existing)
- `content: MessageContent` - Message content (text or multi-modal) (existing)
- `role: 'user' | 'assistant'` - Message sender role (existing)
- `isStreaming?: boolean` - Whether message is currently streaming (existing)
- `toolsUsed?: string[]` - **NEW**: Array of tool identifiers/names used in this message

**Relationships**:

- Belongs to `Conversation` (many-to-one)
- `toolsUsed` references tool identifiers from `toolSets` or MCP tool names

**Validation Rules**:

- `toolsUsed` is optional (only present when tools were used)
- `toolsUsed` array should not be empty if present
- Tool identifiers should match known tools from `toolSets` or be valid MCP tool names
- `toolsUsed` should only be set for `role: 'assistant'` messages

**State Transitions**:

- Message created without `toolsUsed` → Tool detected → `toolsUsed` array populated
- During streaming: `toolsUsed` can be updated incrementally as tools are detected
- After streaming: `toolsUsed` is final and immutable

### Tool Usage Information

**Purpose**: Represents which tools were invoked during an AI response.

**Fields** (derived from Message.toolsUsed):

- `toolId: string` - Tool identifier (from `toolsUsed` array)
- `toolName: string` - Display name (mapped from `toolSets` or MCP tool name)
- `toolIcon: string | ReactNode` - Icon for display (from `getToolIcon` function)
- `toolType?: 'user-selected' | 'auto-invoked' | 'mcp'` - Optional tool type classification

**Relationships**:

- Derived from `Message.toolsUsed` array
- References `toolSets` for display metadata

**Validation Rules**:

- Tool ID must be non-empty string
- Tool name should have fallback if mapping fails
- Tool icon should have fallback if not found

## Data Flow

### Tool Detection Flow

1. **Backend (chat.ts)**:
   - LangGraph stream event received
   - Check for `tool_calls` in event data
   - Extract tool names/IDs
   - Send SSE event: `{ type: 'tool_usage', tools: [...] }`

2. **Frontend (useSendMessage.ts)**:
   - Receive `tool_usage` SSE event
   - Update message's `toolsUsed` field
   - Trigger re-render of message component

3. **Display (ActiveMessageContent.tsx)**:
   - Check if message has `toolsUsed` array
   - Map tool IDs to display names/icons
   - Render `ToolUsageDisplay` component
   - Show at top of assistant message

### Tool Mapping Flow

1. Tool ID from stream → Check `toolSets[toolId]` → Get `name` and icon
2. If not in `toolSets` → Assume MCP tool → Use ID as name, default icon
3. Display with MUI Accordion component

## Edge Cases

- **Unknown tool ID**: Use tool ID as display name, show default icon
- **Empty toolsUsed array**: Should not occur, but handle gracefully (don't render)
- **Tool ID missing from toolSets**: Fallback to ID string, default icon
- **Multiple calls to same tool**: Show tool once (deduplicate in display)
- **Tool call during streaming**: Update `toolsUsed` incrementally, re-render component
