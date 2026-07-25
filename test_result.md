#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

user_problem_statement: |
  Building "The Private Ledger" — an Android-first privacy-focused personal finance app that
  automatically captures transactions from bank/UPI SMS notifications. Requires 3-layer parsing
  (templates → LLM fallback → user teaching), premium UI with cashflow/donut/analytics,
  Need/Want/Investment tagging, and BYOK AI processing (local-first storage).

frontend:
  - task: "Premium Total Balance Hero (gradient + trend indicator)"
    implemented: true
    working: true
    file: "/app/frontend/src/components/BalanceHero.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: |
            Replaced the flat balance card with a premium hero: 3-stop LinearGradient
            (blue→indigo→violet) with two ambient orb overlays (top-right + bottom-left) for
            a soft mesh feel, a subtle top-to-bottom sheen for depth, larger ₹ typography
            (44pt), inline period label chip ("THIS MONTH"), directional icon-backed
            Income/Expense stats, and a "% vs previous" trend pill (null-safe: shows "New
            activity" via sparkles icon when no previous data). Verified via screenshot with
            demo data — renders ₹77.4K balance with orb glow.

  - task: "Dynamic date range for Cash Flow card (inline segmented + sparkline)"
    implemented: true
    working: true
    file: "/app/frontend/src/components/CashFlowCard.tsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: |
            Rebuilt CashFlowCard as a self-contained widget with its own 7D/30D/90D/6M/1Y
            segmented control (independent of the page-level filter). Card now:
            • filters all transactions internally with date-fns
            • computes previous-period totals for a "% vs prev" delta
            • renders a compact SVG sparkline (react-native-svg Polyline) of net cashflow
              buckets (auto-samples into ≤30 buckets), color-coded green/red based on net
            • draws dashed zero-baseline for context
            • shows Income/Expense progress bars and a colored "Net saved / Net spent" pill
            • uses expo-haptics selectionAsync on range change (native only)
            Verified via screenshots at 30D and 90D — sparkline rerenders, "Last N days" label
            updates.

  - task: "Home top row cleanup (Welcome back header + settings shortcut)"
    implemented: true
    working: true
    file: "/app/frontend/app/(tabs)/index.tsx"
    stuck_count: 0
    priority: "low"
    needs_retesting: false
    status_history:
        - working: true
          agent: "main"
          comment: |
            Moved eye/hide toggle into the BalanceHero (right side, glassy pill). Top row
            now shows a two-line "Welcome back / Private Ledger" title and a settings
            shortcut icon that routes to /settings. Removed duplicated maskAmount helper
            and unused LinearGradient/isDark/showRangePicker code.

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 0
  run_ui: false

test_plan:
  current_focus:
    - "Premium Total Balance Hero"
    - "Dynamic date range for Cash Flow card"
  stuck_tasks: []
  test_all: false
  test_priority: "sequential"

agent_communication:
    - agent: "main"
      message: |
        Completed P1 UI polish requested by user:
        1. Premium gradient hero for Total Balance with ambient orbs, trend pill, and
           icon-backed income/expense sub-stats.
        2. Dynamic 7D/30D/90D/6M/1Y range chips inside the Cash Flow card (independent
           of page-level range), plus SVG sparkline of net cashflow trend and previous-
           period % comparison.
        UI-only visual changes verified via screenshot. No backend touched. Native SMS
        listener config plugin unchanged (still pending user's EAS build verification).
