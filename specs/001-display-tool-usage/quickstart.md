# Quickstart: Display Tool Usage in AI Messages

**Feature**: Display Tool Usage in AI Messages  
**Date**: 2025-01-27

## Overview

This feature adds tool usage display at the top of AI assistant messages. When AI uses tools (user-selected, auto-invoked, or MCP tools), users can see which tools were used in a collapsible display.

## User Flow

1. User sends a message that triggers tool usage (e.g., "What's the weather in Shanghai?")
2. AI response streams in, and tool usage information appears at the top of the message
3. User can expand/collapse the tool usage section to see details
4. Tool names are displayed with icons for easy identification

## Implementation Checklist

### Backend Changes

- [ ] Update `src/pages/api/chat.ts`:
  - [ ] Listen for tool calls in LangGraph stream events
  - [ ] Send `tool_usage` SSE events when tools detected
  - [ ] Extract tool names/IDs from `tool_calls` or tool events

### Frontend Changes

- [ ] Update `src/types.ts`:
  - [ ] Add `toolsUsed?: string[]` to `Message` interface

- [ ] Update `src/hooks/useSendMessage.ts`:
  - [ ] Handle `tool_usage` SSE event type
  - [ ] Update message's `toolsUsed` field when event received

- [ ] Create `src/components/ToolUsageDisplay.tsx`:
  - [ ] Use MUI Accordion component
  - [ ] Style with Tailwind CSS
  - [ ] Map tool IDs to names/icons
  - [ ] Handle collapsible state

- [ ] Update `src/components/ActiveMessageContent.tsx`:
  - [ ] Check for `toolsUsed` in assistant messages
  - [ ] Render `ToolUsageDisplay` at top of message
  - [ ] Position before message content

## Testing

1. **Test tool display**:
   - Send message triggering tool usage
   - Verify tools appear at top of AI message
   - Verify tools are collapsible

2. **Test multiple tools**:
   - Trigger multiple tool calls
   - Verify all tools displayed
   - Verify deduplication if same tool called multiple times

3. **Test streaming**:
   - Verify tools appear during streaming (before content completes)
   - Verify tools update if detected incrementally

4. **Test edge cases**:
   - Message without tools (no tool display)
   - Unknown tool IDs (fallback display)
   - Tool call failure (tool still displayed)

## Key Files

- `src/pages/api/chat.ts` - SSE stream with tool_usage events
- `src/hooks/useSendMessage.ts` - Handle tool_usage events
- `src/components/ToolUsageDisplay.tsx` - New collapsible tool display component
- `src/components/ActiveMessageContent.tsx` - Render tool display in messages
- `src/types.ts` - Message type with toolsUsed field
