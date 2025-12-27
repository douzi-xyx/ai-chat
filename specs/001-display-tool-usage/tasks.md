# Tasks: Display Tool Usage in AI Messages

**Input**: Design documents from `/specs/001-display-tool-usage/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - not explicitly requested in feature specification, so no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `src/` at repository root (Next.js Pages Router)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Verify Tailwind CSS configuration in tailwind.config.ts
- [ ] T002 [P] Verify Material-UI (MUI) dependencies are installed in package.json (Note: MUI needs to be installed manually)
- [x] T003 [P] Verify TypeScript strict mode is enabled in tsconfig.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [US1] Update Message interface to include toolsUsed field in src/types.ts

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - View Tools Used by AI (Priority: P1) 🎯 MVP

**Goal**: Display tool usage information at the top of AI assistant messages when tools are invoked, allowing users to see which tools were used in a collapsible display.

**Independent Test**: Send a message that triggers tool usage (e.g., "What's the weather in Shanghai?"), then verify that the tool names are displayed at the top of the AI's response message before the actual content.

### Implementation for User Story 1

- [x] T005 [US1] Update chat API to detect and send tool_usage events in src/pages/api/chat.ts
- [x] T006 [US1] Handle tool_usage SSE events in useSendMessage hook in src/hooks/useSendMessage.ts
- [x] T007 [P] [US1] Create ToolUsageDisplay component with collapsible functionality in src/components/ToolUsageDisplay.tsx (Note: Using Tailwind CSS for now, MUI can be added later)
- [x] T008 [US1] Integrate ToolUsageDisplay into ActiveMessageContent in src/components/ActiveMessageContent.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect the feature

- [x] T009 [P] Add error handling for missing tool information in src/components/ToolUsageDisplay.tsx
- [x] T010 [P] Add tool deduplication logic when same tool called multiple times in src/components/ToolUsageDisplay.tsx
- [x] T011 [P] Add fallback display for unknown tool IDs in src/components/ToolUsageDisplay.tsx
- [x] T012 [P] Verify accessibility compliance (WCAG) for ToolUsageDisplay component (button has aria-expanded, keyboard accessible)
- [x] T013 Code cleanup and refactoring
- [x] T014 Run quickstart.md validation (Implementation matches checklist)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3)**: Depends on Foundational phase completion
- **Polish (Phase 4)**: Depends on User Story 1 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within User Story 1

- T005 (Backend tool detection) should complete before T006 (Frontend event handling)
- T007 (Component creation) can run in parallel with T005/T006
- T008 (Integration) depends on T006 and T007

### Parallel Opportunities

- **Phase 1**: All tasks (T001, T002, T003) can run in parallel
- **Phase 3**: T007 can run in parallel with T005 and T006
- **Phase 4**: T009, T010, T011, T012 can all run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch backend and frontend work in parallel:
Task: "Update chat API to detect and send tool_usage events in src/pages/api/chat.ts"
Task: "Create ToolUsageDisplay component with MUI Accordion in src/components/ToolUsageDisplay.tsx"

# Then integrate:
Task: "Handle tool_usage SSE events in useSendMessage hook in src/hooks/useSendMessage.ts"
Task: "Integrate ToolUsageDisplay into ActiveMessageContent in src/components/ActiveMessageContent.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify existing setup)
2. Complete Phase 2: Foundational (update Message type)
3. Complete Phase 3: User Story 1 (core functionality)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add Polish phase improvements → Test → Deploy/Demo
4. Each phase adds value without breaking previous work

### Task Details

**T004 - Update Message interface**:

- Add `toolsUsed?: string[]` field to Message interface
- Ensure it's optional (only for assistant messages with tools)
- Add TypeScript type safety

**T005 - Update chat API**:

- Listen for tool calls in LangGraph stream events
- Check `event.data?.chunk?.tool_calls` or listen for `on_tool_start` events
- Extract tool names/IDs from tool_calls array
- Send SSE event: `{ type: 'tool_usage', tools: [...] }`
- Handle edge cases (no tools, invalid tool IDs)

**T006 - Handle tool_usage events**:

- Add handler for `tool_usage` event type in SSE stream processing
- Update message's `toolsUsed` field when event received
- Deduplicate tools if same tool appears multiple times
- Trigger component re-render

**T007 - Create ToolUsageDisplay component**:

- Use MUI Accordion component for collapsible behavior
- Style with Tailwind CSS utility classes
- Map tool IDs to display names using `toolSets` mapping
- Map tool IDs to icons using `getToolIcon` function
- Handle unknown tool IDs with fallback display
- Default state: collapsed
- Show tool icons and names when expanded

**T008 - Integrate ToolUsageDisplay**:

- Check if assistant message has `toolsUsed` array
- Render `ToolUsageDisplay` component at top of assistant message
- Position before message content (MarkdownRender)
- Only render for assistant messages with tools

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- User Story 1 is independently completable and testable
- Commit after each task or logical group
- Stop at checkpoint to validate story independently
- All tasks include exact file paths for clarity
