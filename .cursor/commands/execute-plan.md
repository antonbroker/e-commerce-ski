# execute-plan

Execute implementation plan phase-by-phase, keeping user engaged and in flow.

## Critical Rules

1. NEVER execute entire plan - Go phase-by-phase with confirmation gates
2. ALWAYS keep user engaged - Quick choices (a/b/c), feedback after each phase
3. ASK for review when uncertain - If confidence < 90%, pause and explain concern
4. BE CONCISE - No fluff, don't re-list the plan

## Existing TODOs

If plan has pre-created TODOs:
- DO NOT edit plan file or create new todos
- Mark in_progress as you work, starting with first
- DO NOT stop until all complete

## Workflow

### Step 0: Validate Prerequisites

Check:
- [ ] Implementation plan exists (TODO items, phases, or steps)
- [ ] Plan is clear and executable

If unclear: Ask for clarification before starting.

──────────

### Step 1: Parse Plan

Auto-detect plan structure (TODO items, phases, or mixed). Don't re-output the plan.

Output:
Found plan with X phases. Ready to execute.

──────────

### Step 2: Clarify Choices (Optional)

ONLY if genuinely unclear. Format as bullet list with lettered options:

[N] quick choices:

[Category]?

- a) [Option] (preferred)
- b) [Option]

I'll assume a) if you don't decide.

STOP. Wait for input.

### Step 3: Execute Phase-by-Phase

Format per phase:

**Phase [N]/[Total] — [Phase name]**

──────────

**What I'm doing:**
- [Task 1]
- [Task 2]

[Execute tasks]

**Results:**
✅ [Completed item]
⚠️ [Issue or decision]

**Review needed?** [Only if confidence < 90%]
🔍 `path/to/file.ts:123-145`
Why: [1 sentence]

──────────

**Before Phase [N 1]:**

[Question or choice about next phase]

- a) [Proceed as planned]
- b) [Alternative]

Or say "continue".

STOP. Wait for input.

──────────

### Step 4: Completion

After all phases:

✅ All phases complete

**Next:**
- a) Test it
- b) Review changes
- c) Move to next feature

## Message Patterns

Decision Point:
⚠️ Found [issue]:
- a) [Safe approach]
- b) [Better but more work]

Recommend: a) because [reason]

Review Request (confidence < 90%):
🔍 Review: `path/to/file.ts:45-89`
Why: [Concern]

- a) Looks good
- b) Needs adjustment

## Mermaid (Optional)

Use ONLY for complex flows (3  components, state machines, API sequences). Keep to 5-7 nodes max.

✅ Use: Data flow, state transitions, request/response cycles
❌ Don't: Linear steps, single file changes, obvious flows

Example:
mermaid

graph LR
    A[User] --> B[API] --> C[DB]
    B --> D[Cache]

## Adaptation

- User suggests changes → Update remaining phases, confirm
- Phase fails → Offer alternatives
- Scope grows → Acknowledge, extend plan or defer

## Example

Phase 2/4 — Auth flow

──────────

What I'm doing:
- Implement OAuth callback
- Setup session management

[Execute tasks]

Results:
✅ OAuth callback implemented
✅ Session store configured
⚠️ Edge case: concurrent logins

Review needed (confidence: 75%)

🔍 src/auth/callback.ts:34-67
Why: Race condition on concurrent logins

- a) Looks good
- b) Needs adjustment

──────────

Before Phase 3:

Add rate limiting now or after?

- a) Add now (5 min)
- b) After auth works (recommended)

STOP. Wait for input.

## Confidence Thresholds

- 90-100% → No review, proceed
- 70-89% → Ask for review with specific concern
- < 70% → Always ask for review

Lower confidence: Unfamiliar patterns, edge cases, security code, race conditions, data migration.

## Explanation

When to explain: Architecture changes (3  components), non-obvious decisions, complex logic
When NOT: CRUD operations, standard patterns, refactoring, formatting

Keep brief: What changed (1 sentence), why (1 sentence), key points (1-2 bullets)

