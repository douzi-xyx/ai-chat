<!--
Sync Impact Report:
Version: 0.0.0 → 1.0.0 (MAJOR: Initial constitution creation)
Modified principles: N/A (initial creation)
Added sections: Frontend Technology Stack (mandatory requirement)
Removed sections: N/A
Templates requiring updates:
  ✅ plan-template.md - Constitution Check section will reference frontend stack requirement
  ✅ spec-template.md - Requirements section should include frontend stack validation
  ✅ tasks-template.md - Setup phase should include frontend stack initialization
Follow-up TODOs: None
-->

# my-lg-chat-app Constitution

## Core Principles

### I. Frontend Technology Stack (MANDATORY)

All frontend components and UI implementations MUST use Tailwind CSS for styling and Material-UI (MUI) for component library. This ensures consistent design system, rapid development, and maintainable codebase. Tailwind CSS provides utility-first styling while MUI offers production-ready React components with accessibility built-in.

**Rationale**: Standardizing on Tailwind CSS + MUI provides:

- Consistent design language across the application
- Reduced development time with pre-built components
- Better accessibility and responsive design out of the box
- Easier onboarding for new developers familiar with these tools

### II. Type Safety

All TypeScript code MUST use strict type checking. Avoid `any` types unless absolutely necessary and document the rationale. Use Zod schemas for runtime validation where data crosses boundaries (API requests/responses, user input).

**Rationale**: Type safety prevents runtime errors, improves developer experience with better IDE support, and serves as living documentation.

### III. API Design

API routes MUST follow RESTful conventions. Use Next.js API routes for backend functionality. All API responses MUST include proper error handling and status codes. Stream responses for long-running operations (e.g., chat streaming).

**Rationale**: RESTful APIs are well-understood, maintainable, and integrate easily with frontend frameworks. Streaming improves user experience for real-time features.

### IV. State Management

Use React hooks and context for local component state. For global state, prefer lightweight solutions (React Context, Zustand) over heavy frameworks unless complexity justifies it.

**Rationale**: Simplicity reduces cognitive load and bundle size. Complex state management should only be introduced when patterns emerge that justify it.

### V. Error Handling

All user-facing errors MUST be displayed with clear, actionable messages. Log errors server-side with sufficient context for debugging. Never expose internal error details to end users.

**Rationale**: Good error handling improves user experience and accelerates debugging during development and production.

## Technology Stack Requirements

### Frontend Stack (MANDATORY)

- **Styling**: Tailwind CSS MUST be used for all styling. Utility classes preferred over custom CSS.
- **Component Library**: Material-UI (MUI) MUST be used for all UI components (buttons, forms, dialogs, etc.).
- **Framework**: Next.js (Pages Router or App Router as appropriate)
- **Language**: TypeScript with strict mode enabled

### Backend Stack

- **Runtime**: Node.js
- **Framework**: Next.js API routes
- **Database**: SQLite (via better-sqlite3) for local development and small-scale deployments
- **AI/LLM**: LangChain with LangGraph for agent orchestration

### Development Tools

- **Package Manager**: pnpm (as specified in package.json)
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Type Checking**: TypeScript compiler

## Development Workflow

### Code Quality

- All code MUST pass linting and type checking before commit
- Use Prettier for consistent code formatting
- Follow Next.js best practices and conventions

### Testing Strategy

- Write tests for critical business logic
- Integration tests for API routes
- Component tests for complex UI interactions
- Manual testing for user flows

### Documentation

- Document complex algorithms and business logic
- Keep README.md updated with setup and deployment instructions
- Document API endpoints and their expected inputs/outputs

## Governance

This constitution supersedes all other development practices. All pull requests and code reviews MUST verify compliance with these principles.

**Amendment Process**:

1. Propose changes with clear rationale
2. Update constitution version following semantic versioning
3. Update all dependent templates and documentation
4. Communicate changes to all contributors

**Compliance Review**:

- Constitution Check MUST be performed before Phase 0 research in feature planning
- Re-check after Phase 1 design
- All violations MUST be justified in Complexity Tracking section

**Version**: 1.0.0 | **Ratified**: 2025-01-27 | **Last Amended**: 2025-01-27
