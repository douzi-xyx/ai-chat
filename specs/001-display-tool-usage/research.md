# Research: Display Tool Usage in AI Messages

**Feature**: Display Tool Usage in AI Messages  
**Date**: 2025-01-27  
**Phase**: 0 - Research

## Research Questions & Findings

### 1. How to Extract Tool Calls from LangGraph Stream Events?

**Decision**: Listen to `on_chat_model_stream` events and check for `tool_calls` in the chunk data, or listen to `on_tool_start` / `on_tool_end` events if available.

**Rationale**:

- LangGraph's `streamEvents` API provides various event types
- AIMessage objects contain `tool_calls` array when tools are invoked
- Current implementation only listens to `on_chat_model_stream` for content chunks
- Need to also listen for tool invocation events or check message chunks for tool_calls

**Alternatives considered**:

- Polling the conversation state: Too inefficient, adds latency
- Only checking final message: Would delay tool display until response completes
- Using separate endpoint: Adds complexity, current SSE stream is sufficient

**Implementation approach**:

- Check `event.data?.chunk?.tool_calls` in `on_chat_model_stream` events
- Or listen for `on_tool_start` event type if available in LangGraph
- Extract tool names from tool_calls array
- Send tool usage data via SSE with type `tool_usage`

### 2. How to Implement Collapsible Tool Display with MUI?

**Decision**: Use MUI's `Accordion` or `Collapse` component with custom styling via Tailwind CSS.

**Rationale**:

- MUI Accordion provides built-in expand/collapse functionality
- Can be styled with Tailwind CSS classes
- Supports accessibility out of the box
- Fits the requirement for collapsible tool display

**Alternatives considered**:

- Custom React state with conditional rendering: More code, less accessible
- MUI Drawer: Overkill for inline tool display
- Native HTML details/summary: Less customizable, not using MUI

**Implementation approach**:

- Use MUI `Accordion` component for collapsible behavior
- Style with Tailwind CSS utility classes
- Default state: collapsed (to save space)
- Show tool icons and names when expanded

### 3. How to Update Message Type to Include Tool Usage?

**Decision**: Add optional `toolsUsed` field to Message interface with array of tool identifiers.

**Rationale**:

- Non-breaking change (optional field)
- Simple array structure for multiple tools
- Tool identifiers can be mapped to display names/icons
- Compatible with existing message structure

**Alternatives considered**:

- Separate tool usage entity: Over-engineered for simple display need
- Nested tool details object: More complex than needed initially
- Tool usage in message metadata: Less discoverable

**Implementation approach**:

```typescript
interface Message {
  // ... existing fields
  toolsUsed?: string[]; // Array of tool IDs/names
}
```

### 4. How to Send Tool Usage in Real-Time During Streaming?

**Decision**: Add new SSE event type `tool_usage` sent immediately when tools are detected.

**Rationale**:

- Maintains existing SSE stream architecture
- Allows real-time display before content streaming completes
- Minimal changes to existing stream handling code
- Frontend can update tool display as tools are detected

**Alternatives considered**:

- Wait until stream completes: Violates requirement for real-time display
- Separate WebSocket: Adds complexity, SSE is sufficient
- Polling: Inefficient and adds latency

**Implementation approach**:

- In `chat.ts`, when tool_calls detected, send: `{ type: 'tool_usage', tools: [...] }`
- Frontend handles `tool_usage` event type in `useSendMessage.ts`
- Update message's `toolsUsed` field immediately

### 5. How to Map Tool IDs to Display Names and Icons?

**Decision**: Use existing `toolSets` mapping and `getToolIcon` function from `index.tsx`.

**Rationale**:

- Reuse existing tool configuration
- Consistent with current tool selection UI
- No need for duplicate tool metadata
- Supports both user-selected tools and MCP tools

**Alternatives considered**:

- New tool metadata service: Unnecessary duplication
- Hardcoded tool names: Not maintainable
- Tool registry: Over-engineered

**Implementation approach**:

- Import `toolSets` and `getToolIcon` function
- Map tool IDs from stream to tool names via `toolSets`
- For MCP tools, use tool name directly or fallback identifier
- Display with icons from `getToolIcon` function

## Technical Decisions Summary

1. **Tool Detection**: Check `tool_calls` in LangGraph stream events
2. **UI Component**: MUI Accordion with Tailwind CSS styling
3. **Data Structure**: Add optional `toolsUsed: string[]` to Message type
4. **Stream Protocol**: Add `tool_usage` SSE event type
5. **Tool Mapping**: Reuse existing `toolSets` and `getToolIcon` utilities

## Open Questions Resolved

All research questions have been resolved. No remaining clarifications needed.
