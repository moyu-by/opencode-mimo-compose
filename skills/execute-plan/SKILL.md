---
name: execute-plan
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
---

# Executing Plans

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the SKILL:execute-plan skill to implement this plan."

**Note:** Tell your human partner that Compose works much better with access to subagents. The quality of its work will be significantly higher if run on a platform with subagent support (such as Claude Code or Codex). If subagents are available, use SKILL:subagent-dev instead of this skill.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create a task per plan task with the `task` tool and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Complete Development

After all tasks complete and verified:
- Use SKILL:report-completion to write the final report (summarizes what was built in human-readable form)
- Report skill will transition to SKILL:merge-work on completion

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Use `SKILL:ask-user` to present the blocker and options rather than describing it in free text.** If no user is available, resolve the blocker with your best judgment and continue.

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent

## Integration

**Required workflow skills:**
- **SKILL:isolated-worktree** - Ensures isolated workspace (creates one or verifies existing)
- **SKILL:write-plan** - Creates the plan this skill executes
- **SKILL:report-completion** - Write final report after all tasks complete
- **SKILL:merge-work** - Complete development (invoked by report skill)
