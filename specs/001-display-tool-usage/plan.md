# Implementation Plan: Display Tool Usage in AI Messages

**Branch**: `001-display-tool-usage` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-display-tool-usage/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Display tool usage information at the top of AI assistant messages when tools are invoked. The feature requires:

1. Extracting tool call information from LangChain stream events
2. Sending tool usage data to frontend via SSE stream
3. Displaying tools in a collapsible component using Tailwind CSS and MUI
4. Updating Message type to include tool usage information

## Technical Context

**Language/Version**: TypeScript 5.x, React 19.2.0, Next.js 16.0.7  
**Primary Dependencies**:

- Frontend: Tailwind CSS 4.x, Material-UI (MUI), React
- Backend: LangChain LangGraph, Next.js API routes
- Existing: Tool binding and invocation already implemented  
  **Storage**: N/A (tool usage is displayed in real-time, not persisted separately)  
  **Testing**: Manual testing for UI components, integration testing for stream events  
  **Target Platform**: Web browser (Next.js web application)  
  **Project Type**: Web application (Next.js Pages Router)  
  **Performance Goals**: Tool usage information displayed within 1 second of detection during streaming  
  **Constraints**:
- Must use Tailwind CSS for all styling
- Must use MUI components
- Must support real-time display during streaming
- Tool display must be collapsible using React
  **Scale/Scope**: Single feature addition to existing chat interface, affects message rendering component

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Frontend Stack Compliance**:

- ✅ All UI components MUST use Tailwind CSS for styling
- ✅ All UI components MUST use Material-UI (MUI) component library
- ✅ TypeScript strict mode MUST be enabled
- ✅ No custom CSS files unless Tailwind utilities are insufficient (must be justified)

**Other Constitution Gates**:

- ✅ Type Safety: All code MUST use TypeScript with strict type checking
- ✅ State Management: Use React hooks for local component state (collapsible state)
- ✅ Error Handling: Handle cases where tool information is missing gracefully

## Project Structure

### Documentation (this feature)

```text
specs/001-display-tool-usage/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ActiveMessageContent.tsx    # Main message rendering (needs update)
│   └── ToolUsageDisplay.tsx        # New component for tool display
├── hooks/
│   └── useSendMessage.ts           # Message streaming (needs update)
├── pages/
│   └── api/
│       └── chat.ts                  # API route (needs update for tool events)
└── types.ts                         # Message types (needs update)
```

**Structure Decision**: Single Next.js web application. New component `ToolUsageDisplay.tsx` will be added to components directory. Updates needed in existing files: `ActiveMessageContent.tsx`, `useSendMessage.ts`, `chat.ts`, and `types.ts`.

## Phase 0: Research Complete

All research questions resolved. See `research.md` for details:

- Tool extraction from LangGraph stream events
- MUI collapsible component implementation
- Message type extension
- Real-time tool usage streaming
- Tool ID to display name/icon mapping

## Phase 1: Design Complete

Design artifacts generated:

- **data-model.md**: Message entity with `toolsUsed` field, tool usage information structure
- **contracts/sse-events.md**: SSE event contract for `tool_usage` event type
- **quickstart.md**: Implementation checklist and testing guide

**Agent Context Updated**: Cursor IDE context file updated with TypeScript, React, Next.js information.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - all requirements align with constitution.
