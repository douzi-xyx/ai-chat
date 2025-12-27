# SSE Events Contract: Tool Usage

**Feature**: Display Tool Usage in AI Messages  
**Date**: 2025-01-27  
**Phase**: 1 - Design

## Event Types

### Existing Events

- `chunk`: Content chunk from AI response
  ```json
  { "type": "chunk", "content": "text content" }
  ```

- `end`: Stream completion
  ```json
  { "type": "end", "thread_id": "conversation-id" }
  ```

- `error`: Error occurred
  ```json
  { "type": "error", "message": "error message" }
  ```

### New Event: tool_usage

**Purpose**: Notify frontend when tools are detected during AI response generation.

**Event Format**:
```json
{
  "type": "tool_usage",
  "tools": ["tool-id-1", "tool-id-2", "mcp-tool-name"]
}
```

**Fields**:
- `type: "tool_usage"` - Event type identifier
- `tools: string[]` - Array of tool identifiers/names

**When Sent**:
- Immediately when tool calls are detected in LangGraph stream events
- Can be sent multiple times if tools are detected incrementally
- Should be sent before or alongside content chunks

**Frontend Handling**:
- Update message's `toolsUsed` field with received tool IDs
- Trigger component re-render to display tools
- Deduplicate tools if same tool appears multiple times

**Example Sequence**:
```
data: {"type":"tool_usage","tools":["weather"]}
data: {"type":"chunk","content":"查询"}
data: {"type":"chunk","content":"天气"}
data: {"type":"end","thread_id":"123"}
```

## API Contract

### POST /api/chat

**Request**: (unchanged)
```json
{
  "message": "What's the weather?",
  "conversationId": "thread-id",
  "model": "openai:model-name",
  "toolIds": ["weather"],
  "images": []
}
```

**Response**: Server-Sent Events (SSE) stream

**New Event Added**: `tool_usage` event type

**Response Sequence Example**:
```
data: {"type":"tool_usage","tools":["weather"]}

data: {"type":"chunk","content":"当前"}

data: {"type":"chunk","content":"天气"}

data: {"type":"chunk","content":"：晴天"}

data: {"type":"end","thread_id":"thread-id"}
```

## Error Handling

- If tool detection fails: Continue stream without `tool_usage` event
- If invalid tool IDs: Send event with valid tools only, log invalid ones
- If stream fails after `tool_usage` sent: Frontend should still display tools that were detected

