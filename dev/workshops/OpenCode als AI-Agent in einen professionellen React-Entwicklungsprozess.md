# Workshop: OpenCode für React-Entwicklung

**Ziel:** Nach dem Workshop kannst du OpenCode als AI-Development-Agent in einem professionellen React-Projekt einsetzen.

**Dauer:** ca. 1–2 Tage
**Level:** Fortgeschrittener React-/TypeScript-Entwickler
**Projekt:** React + TypeScript + Vite + React Router + TanStack Query + Tailwind/shadcn/ui
**Workflow:** OpenCode + Git + GitHub

---

## 1. Was ist OpenCode?

### Theorie

* Was ist OpenCode?
* OpenCode vs. GitHub Copilot
* OpenCode vs. Claude Code
* OpenCode vs. Cursor
* LLM, Agent und Tool Calling
* Was bedeutet „Agentic Coding“?
* Kontext und Codebase verstehen
* Warum OpenCode für größere Projekte interessant ist

### Praxis

Wir starten mit:

```bash
git clone <react-project>
cd react-project
opencode
```

Dann lassen wir OpenCode zunächst **nichts verändern**.

Prompt:

```text
Analyze this React project.

Do not modify any files.

Explain:
1. project architecture
2. main entry points
3. routing
4. state management
5. API communication
6. reusable components
7. testing setup
8. potential architectural problems
```

Ziel:

> Erst verstehen, dann programmieren.

---

# 2. OpenCode installieren und konfigurieren

Wir untersuchen:

```text
opencode
opencode run
opencode --help
```

und die Projektstruktur von OpenCode.

Zum Beispiel:

```text
.opencode/
├── agents/
├── commands/
├── skills/
└── ...
```

sowie Konfiguration und Projektregeln.

---

# 3. OpenCode UI kennenlernen

Wir gehen die Oberfläche vollständig durch:

* Chat
* Sessions
* Agents
* Models
* Tools
* Files
* Context
* Permissions
* Commands
* History
* Undo/Redo
* Diff
* Terminal
* Git

Besonders wichtig:

### Plan → Implement → Review

Nicht:

```text
"Build me a dashboard."
```

sondern:

```text
Analyze the requirements.

Create an implementation plan.

Do not modify files yet.
```

Danach:

```text
Implement the approved plan.
```

---

# 4. Erster Feature-Workflow

Wir bauen gemeinsam ein echtes Feature.

### Beispiel

Unser React-Projekt bekommt:

```text
User Management
```

Features:

* User list
* Search
* Filter
* Pagination
* Create user
* Edit user
* Delete user
* Loading state
* Error handling
* Empty state

OpenCode bekommt zunächst:

```text
Implement a user management feature.

Before coding:
- inspect the existing architecture
- identify reusable components
- identify existing API patterns
- identify routing conventions
- identify state-management conventions

Do not invent a new architecture.

First create an implementation plan.
```

---

# 5. Context Engineering

Das ist einer der wichtigsten Teile des Workshops.

Wir lernen:

### Schlechter Prompt

```text
Create a user page.
```

### Besser

```text
Create a user management page.

Follow the existing project architecture.

Before implementing:
- inspect src/features
- inspect existing API hooks
- inspect routing
- inspect UI components

Reuse existing components whenever possible.

Do not introduce new dependencies.

Follow existing TypeScript conventions.
```

Wir sprechen über:

* Kontextgröße
* relevante Dateien
* Repository-Kontext
* Architektur-Kontext
* Constraints
* Definition of Done

---

# 6. AGENTS.md / Projektregeln

Wir erstellen Projektregeln.

Beispiel:

```text
AGENTS.md
```

mit Regeln wie:

```text
# React Project Rules

## Architecture

Use feature-based architecture.

## TypeScript

Do not use `any`.

Prefer interfaces for public contracts.

## React

Use functional components.

Use hooks instead of class components.

## API

Use TanStack Query for server state.

## Styling

Use Tailwind CSS.

## Components

Reuse existing components before creating new ones.

## Testing

Every new feature must include tests.

## Git

Never modify unrelated files.
```

Dann testen wir:

> Versteht OpenCode diese Regeln?

---

# 7. Agents

Jetzt wird es interessant.

Wir erstellen unterschiedliche Agents.

Beispielsweise:

```text
Developer
Code Reviewer
Test Engineer
UI Specialist
Architect
Debugger
```

### Developer Agent

Aufgabe:

```text
Implement features.
```

### Reviewer Agent

Aufgabe:

```text
Review code.

Do not modify files.

Look for:
- bugs
- architecture problems
- security issues
- performance issues
- TypeScript problems
- React anti-patterns
- unnecessary complexity
```

### Test Agent

```text
Analyze the feature and create missing tests.
```

Damit lernen wir:

> Nicht jeder Agent muss programmieren.

---

# 8. Custom Commands

Wir bauen eigene Commands.

Zum Beispiel:

```text
/review
```

```text
/test
```

```text
/feature
```

```text
/bugfix
```

```text
/refactor
```

```text
/security
```

Beispiel:

```text
/review
```

soll automatisch:

1. Git changes analysieren
2. betroffene Dateien untersuchen
3. Architektur prüfen
4. Bugs suchen
5. Performance prüfen
6. Ergebnis reporten

---

# 9. Skills

Jetzt bauen wir wiederverwendbare Skills.

Beispiel:

```text
React Feature Development
```

Der Skill beschreibt:

```text
How React features should be implemented in this project.
```

Ein anderer:

```text
React Testing
```

und:

```text
API Integration
```

oder:

```text
UI Accessibility
```

Damit können wir Wissen vom eigentlichen Prompt trennen.

---

# 10. Tools

OpenCode kann nicht nur Text erzeugen.

Wir untersuchen den Tool-Zugriff.

Typische Aufgaben:

```text
Read files
Search code
Modify files
Run commands
Run tests
Run npm
Run git
Inspect project
```

Beispiel:

```text
Find all usages of UserService.

Do not modify anything.
```

Danach:

```text
Run the relevant tests.
```

Danach:

```text
Analyze the test failures.
```

---

# 11. Terminal-Agent

Sehr wichtig für professionelle Nutzung.

OpenCode soll beispielsweise:

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
```

ausführen können.

Workflow:

```text
Implement
     ↓
Build
     ↓
Test
     ↓
Lint
     ↓
Analyze errors
     ↓
Fix
     ↓
Test again
```

Das ist einer der wichtigsten Agent-Workflows.

---

# 12. Debugging mit OpenCode

Wir erzeugen absichtlich einen Bug.

Beispiel:

```text
Users are not displayed after navigating back
from the user details page.
```

OpenCode soll:

1. Problem analysieren
2. reproduzieren
3. relevante Dateien finden
4. Ursache bestimmen
5. Fix vorschlagen
6. Fix implementieren
7. Test hinzufügen

Prompt:

```text
Investigate this bug.

Do not immediately modify code.

First determine:
- reproduction path
- root cause
- affected components
- affected state
- possible regression

Then propose a fix.
```

---

# 13. Refactoring

Wir nehmen absichtlich schlechten Code.

Zum Beispiel:

```tsx
function UserPage() {
    // 300 lines
}
```

OpenCode soll daraus machen:

```text
UserPage
├── UserTable
├── UserFilters
├── UserDialog
├── UserActions
└── useUsers
```

Aber:

> OpenCode darf nicht einfach alles neu schreiben.

Wir definieren Constraints:

```text
Refactor this component.

Requirements:

- preserve behavior
- preserve public APIs
- preserve routing
- preserve styling
- preserve tests
- do not introduce dependencies
- minimize changes
```

---

# 14. Tests mit OpenCode

Wir behandeln:

* Vitest
* React Testing Library
* Unit Tests
* Component Tests
* Integration Tests
* Mocking
* API Tests

Beispiel:

```text
Analyze UserTable.

Identify missing test cases.

Then create tests for:
- loading
- empty state
- successful rendering
- error state
- filtering
- pagination
```

---

# 15. Git mit OpenCode

Professioneller Workflow:

```text
Git status
    ↓
OpenCode analyzes changes
    ↓
Review
    ↓
Tests
    ↓
Commit
```

OpenCode soll beispielsweise analysieren:

```text
Review my current git diff.

Find:
- accidental changes
- debugging code
- unused imports
- incomplete implementation
- potential breaking changes
```

Danach:

```text
Create a commit message for these changes.
```

---

# 16. GitHub Workflow

Wir simulieren einen echten Pull Request.

```text
Issue
 ↓
OpenCode
 ↓
Implementation
 ↓
Tests
 ↓
Review
 ↓
Commit
 ↓
Pull Request
 ↓
CI
```

OpenCode analysiert:

```text
Issue #123

Implement user search with server-side pagination.
```

und erstellt daraus einen Implementierungsplan.

---

# 17. MCP

Ein sehr wichtiger Teil.

Wir erklären:

**Model Context Protocol**

und warum MCP interessant ist.

Beispiele:

```text
OpenCode
   ↓
MCP
   ↓
GitHub
Database
Documentation
Browser
Internal APIs
```

Wir bauen einen MCP-Workflow, bei dem OpenCode zusätzliche Informationen aus einem externen System verwenden kann.

---

# 18. External Documentation

Ein häufiger professioneller Use Case:

```text
Use the official React documentation
to verify whether this implementation
follows current best practices.
```

Oder:

```text
Check the documentation for the library
before implementing the feature.
```

Dabei lernen wir:

* externe Quellen
* Tool-Zugriff
* Kontext
* Halluzination vermeiden

---

# 19. Security

OpenCode soll Code auf Sicherheitsprobleme untersuchen.

Beispiel:

```text
Perform a security review of this React application.

Check:
- XSS
- unsafe HTML
- authentication
- authorization assumptions
- token handling
- secrets
- environment variables
- dependency risks
- API exposure
```

Besonders:

```text
.env
.env.local
API keys
tokens
credentials
```

---

# 20. Performance

Wir nehmen eine langsame React-Komponente.

OpenCode analysiert:

```text
- unnecessary renders
- useEffect misuse
- expensive calculations
- memoization
- large lists
- network requests
- bundle size
- React Query configuration
```

Danach:

```text
Do not optimize blindly.

First identify the actual bottleneck.
```

---

# 21. UI mit OpenCode

Wir bauen eine komplette UI.

Stack:

```text
React
TypeScript
Tailwind
shadcn/ui
```

OpenCode bekommt beispielsweise:

```text
Create an admin dashboard.

Requirements:
- responsive
- accessible
- keyboard navigation
- reusable components
- dark mode
- loading states
- error states
```

Danach Review:

```text
Review the UI for accessibility and UX issues.
```

---

# 22. Multi-Agent Workflow

Jetzt kombinieren wir alles.

```text
             ┌──────────────┐
             │   Architect  │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │   Developer  │
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │ Test Engineer│
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │ Code Reviewer│
             └──────┬───────┘
                    ↓
             ┌──────────────┐
             │ Security     │
             └──────────────┘
```

Das ist besonders interessant für größere Projekte.

---

# 23. OpenCode mit mehreren Modellen

Wir untersuchen:

* Model Provider
* unterschiedliche Modelle
* Kosten
* Geschwindigkeit
* Qualität
* Reasoning
* Coding Performance

Beispiel:

```text
Architecture → stärkeres Reasoning-Modell

Simple refactoring → günstigeres Modell

Code review → anderes Modell

Documentation → schnelles Modell
```

Damit lernen wir:

> Nicht jede Aufgabe braucht das teuerste Modell.

---

# 24. Permissions

Ein sehr wichtiger professioneller Bereich.

Wir sprechen darüber:

```text
Was darf OpenCode?

Was darf OpenCode nicht?

Welche Commands dürfen automatisch ausgeführt werden?

Welche Dateien dürfen verändert werden?
```

Beispielsweise sollte ein Agent nicht einfach:

```bash
rm -rf ...
```

oder produktive Datenbanken verändern können.

---

# 25. Environment Variables & Secrets

Wir behandeln:

```text
.env
.env.local
.env.production
```

und Regeln wie:

```text
Never expose secrets.

Never commit .env files.

Never print API keys.

Never include credentials in source code.
```

---

# 26. Dokumentation erzeugen

OpenCode kann automatisch erstellen:

```text
README.md
ARCHITECTURE.md
API.md
CONTRIBUTING.md
CHANGELOG.md
```

Beispiel:

```text
Analyze the complete project.

Create an ARCHITECTURE.md explaining:
- folder structure
- architecture
- data flow
- API communication
- state management
- authentication
- testing
```

---

# 27. Migration

Sehr praxisnah für dich als .NET-Entwickler:

Wir simulieren beispielsweise:

```text
React Router v6
        ↓
React Router v7
```

oder:

```text
React Query
        ↓
TanStack Query
```

OpenCode soll:

1. Dependencies analysieren
2. Breaking Changes identifizieren
3. Migration planen
4. Code migrieren
5. Tests ausführen
6. Fehler korrigieren

---

# 28. Große Feature-Aufgabe

Am Ende bekommt OpenCode eine komplette Business-Anforderung:

> „Wir benötigen eine Customer Management Application.“

Features:

```text
Authentication
Customers
Search
Filtering
Pagination
Customer details
Customer creation
Customer editing
Customer deletion
Dashboard
Notifications
Error handling
Loading states
Responsive UI
Tests
```

Wir machen **nicht**:

```text
Build everything.
```

Sondern:

```text
Requirement
      ↓
Analysis
      ↓
Architecture
      ↓
Plan
      ↓
Implementation
      ↓
Tests
      ↓
Review
      ↓
Security
      ↓
Performance
      ↓
Documentation
```

---

# 29. Abschlussprojekt

Am Ende soll dein Projekt ungefähr so aussehen:

```text
react-opencode-workshop/
│
├── .opencode/
│   ├── agents/
│   │   ├── architect
│   │   ├── developer
│   │   ├── reviewer
│   │   ├── tester
│   │   └── security
│   │
│   ├── commands/
│   │   ├── feature
│   │   ├── review
│   │   ├── test
│   │   ├── refactor
│   │   └── security
│   │
│   └── skills/
│       ├── react
│       ├── testing
│       ├── accessibility
│       └── api
│
├── src/
│   ├── app/
│   ├── features/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── services/
│
├── tests/
│
├── AGENTS.md
├── README.md
└── package.json
```

---

# 30. Der wichtigste Workflow

Den würde ich dir als **OpenCode Professional Workflow** beibringen:

```text
                 REQUIREMENT
                      │
                      ▼
                 ┌─────────┐
                 │ ANALYZE │
                 └────┬────┘
                      │
                      ▼
                  ┌──────┐
                  │ PLAN │
                  └───┬──┘
                      │
                      ▼
               ┌─────────────┐
               │ IMPLEMENT   │
               └──────┬──────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       BUILD        TEST        LINT
          │           │           │
          └───────────┼───────────┘
                      ▼
                  ┌────────┐
                  │ REVIEW │
                  └────┬───┘
                       │
                       ▼
                 ┌──────────┐
                 │ SECURITY │
                 └────┬─────┘
                      │
                      ▼
               ┌─────────────┐
               │ PERFORMANCE │
               └──────┬──────┘
                      │
                      ▼
                 DOCUMENT
                      │
                      ▼
                    GIT
                      │
                      ▼
                   GITHUB
```

## Workshop-Ziel

Am Ende sollst du nicht einfach sagen können:

> „Ich kann OpenCode benutzen.“

Sondern:

> **„Ich kann OpenCode als AI-Agent in einen professionellen React-Entwicklungsprozess integrieren.“**

 
