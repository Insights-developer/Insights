# AI Assistant Instructions

This file provides instructions for AI assistants interacting with the Insights codebase.

## Priority Reading Order

1. `/COPILOT_OVERVIEW.md` - **ALWAYS START HERE** - Contains high-level architecture and key concepts
2. `/PROJECT_OVERVIEW.md` - General project information and links
3. `/PROJECT_STRUCTURE.md` - Detailed file organization

## Special Instructions

- Always check `COPILOT_OVERVIEW.md` first when learning about the application
- Note that user permissions use Access Groups rather than traditional roles
- Refer to `KNOWN_ISSUES.md` for specific workarounds
- The `role` field in the users table is DEPRECATED - use Access Groups instead

## Preferred Patterns

- Follow the existing error handling and permission checking patterns
- Respect the component organization and separation of concerns
- Prefer composition over inheritance when suggesting UI components
