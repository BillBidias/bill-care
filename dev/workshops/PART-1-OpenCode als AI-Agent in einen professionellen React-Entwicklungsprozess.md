 

# OpenCode + React – Professional Workshop

### Durchgehendes Projekt

Wir entwickeln:

**Bill-Care Management System**

```text
React
├── TypeScript
├── Vite
├── React Router
├── TanStack Query
├── Tailwind CSS
├── shadcn/ui
├── Vitest
├── React Testing Library
├── ESLint -  https://eslint.org/
└── Git / GitHub
```

Am Ende haben wir:

```text
Bill-Care Management
│
├── Dashboard
├── Customers
│   ├── List
│   ├── Search
│   ├── Filter
│   ├── Pagination
│   ├── Details
│   ├── Create
│   ├── Edit
│   └── Delete
├── Authentication
├── Settings
└── Notifications
```

---

# Kapitel 1 – Was ist OpenCode?
- Opencode ist ein Open-Source AI-Coding Agent mit kostenlose modelle inklusive oder Claud einbiden kann.
## Ziel

Verstehen, was OpenCode von einem normalen Chatbot unterscheidet.

### Theorie

Wir betrachten:

```text
Chatbot
   ↓
Code Assistant
   ↓
Coding Agent
```

Ein Agent kann:

```text
Code lesen
   ↓
Code verstehen
   ↓
Dateien suchen
   ↓
Dateien ändern
   ↓
Commands ausführen
   ↓
Tests ausführen
   ↓
Fehler analysieren
   ↓
Code erneut ändern
```

### Übung

```text
Analyze this project.

Do not modify any files.

Explain:

- architecture
- entry points
- routing
- state management
- API layer
- components
- tests
- build process
```

### Lernziel

Du lernst:

> OpenCode zuerst als **Analyst**, danach als **Developer** einzusetzen.

---

# Kapitel 2 – Installation und erster Start

## Ziel

OpenCode in einem React-Projekt einsetzen.

Wir starten mit einem vorhandenen Projekt:

```bash
git clone <repository>
cd customer-management
```

Dann OpenCode starten.

### Übung

```text
What can you do in this project?

Do not modify anything.
```

Danach:

```text
Show me the project architecture.
```

### Kontrolle

Prüfen:

* Erkennt OpenCode `src`?
* Erkennt es React?
* Erkennt es TypeScript?
* Erkennt es Routing?
* Erkennt es Tests?

---

# Kapitel 3 – OpenCode UI

## Ziel

Die wichtigsten Bereiche kennenlernen.

Wir untersuchen:

* Sessions
* Context
* Files
* Agents
* Models
* Tools
* Terminal
* Permissions
* Commands
* Git
* Diff

### Übung

```text
Explain the current project without modifying it.

For every important part, mention
which files you inspected.
```

### Lernziel

Du verstehst:

> Was macht OpenCode gerade tatsächlich?

---

# Kapitel 4 – Codebase verstehen

Jetzt lassen wir OpenCode eine vollständige Analyse durchführen.

```text
Perform a complete codebase analysis.

Do not modify files.

Analyze:

1. architecture
2. folder structure
3. components
4. hooks
5. services
6. API communication
7. routing
8. state management
9. error handling
10. testing
11. configuration
12. dependencies
```

### Aufgabe

Vergleiche die Analyse mit deinem eigenen Verständnis.

Frage:

> Hat OpenCode die Architektur richtig verstanden?

---

# Kapitel 5 – Context Engineering

Das ist eines der wichtigsten Kapitel.

## Schlechter Prompt

```text
Create a customer page.
```

## Besser

```text
Create a customer page.

Before coding:

- inspect existing routes
- inspect existing components
- inspect API services
- inspect hooks
- inspect tests

Reuse existing patterns.

Do not introduce dependencies.

Do not modify unrelated files.

First create a plan.
```

### Lernziel

Du lernst:

```text
Prompt
+
Context
+
Constraints
+
Expected Result
+
Validation
```

---

# Kapitel 6 – AGENTS.md

Jetzt definieren wir Projektregeln.

```text
AGENTS.md
```

Beispiel:

```text
# React Project Rules

## Architecture

Use feature-based architecture.

## TypeScript

Never use `any`.

Use explicit types.

## React

Use functional components.

Prefer hooks.

## API

Use TanStack Query.

## UI

Reuse existing components.

Use Tailwind CSS.

## Testing

New features require tests.

## Dependencies

Do not add dependencies without justification.
```

### Übung

```text
Review AGENTS.md.

Identify missing rules for a professional React project.

Do not modify the file.
```

---

# Kapitel 7 – Planung mit OpenCode

Jetzt kommt der wichtigste Workflow:

```text
Requirement
      ↓
Analysis
      ↓
Plan
      ↓
Implementation
```

Anforderung:

```text
Users need a customer management feature.

Users must be able to:

- list customers
- search customers
- filter customers
- view details
- create customers
- edit customers
- delete customers
```

Prompt:

```text
Do not implement anything.

Analyze the requirement and create
a detailed implementation plan.

Identify:

- files to create
- files to modify
- components
- hooks
- API changes
- tests
- routing changes
```

---

# Kapitel 8 – Erstes Feature implementieren

Jetzt:

```text
Implement the approved plan.

Follow AGENTS.md.

Reuse existing components.

Do not modify unrelated files.

After implementation:

- run tests
- run lint
- run build
```

### Entwicklerkontrolle

Danach:

```bash
git diff
```

Wir überprüfen:

* Architektur
* Codequalität
* unnötige Änderungen
* TypeScript
* React Patterns

---

# Kapitel 9 – Tools

Jetzt lernen wir die Agent-Tools.

OpenCode kann beispielsweise:

```text
Read
Search
Edit
Write
Execute
```

### Übung

```text
Find all usages of CustomerService.
```

Dann:

```text
Find all components
that depend on CustomerService.
```

Dann:

```text
Run the relevant tests.
```

### Lernziel

Verstehen:

> OpenCode arbeitet mit Werkzeugen, nicht nur mit Text.

---

# Kapitel 10 – Terminal

Jetzt geben wir OpenCode Zugriff auf Entwicklungsbefehle.

```bash
npm install
npm run dev
npm run build
npm run test
npm run lint
```

### Workflow

```text
Implement
   ↓
Build
   ↓
Test
   ↓
Lint
   ↓
Fix
   ↓
Test again
```

Prompt:

```text
Run the tests and build.

If something fails:

1. analyze the error
2. identify root cause
3. fix it
4. run the failed command again
```

---

# Kapitel 11 – Agents

Jetzt bauen wir spezialisierte Agents.

```text
agents/
├── architect
├── developer
├── tester
├── reviewer
├── security
└── performance
```

### Architect

```text
Analyze architecture.

Do not modify code.
```

### Developer

```text
Implement the requested feature.
```

### Tester

```text
Analyze missing test coverage
and implement appropriate tests.
```

### Reviewer

```text
Review the implementation.

Do not modify files.
```

---

# Kapitel 12 – Custom Commands

Jetzt erstellen wir eigene Commands.

Zum Beispiel:

```text
/feature
/review
/test
/refactor
/security
/performance
```

### `/review`

Soll beispielsweise automatisch überprüfen:

```text
Git diff
 ↓
Architecture
 ↓
React
 ↓
TypeScript
 ↓
Tests
 ↓
Performance
 ↓
Security
```

### Übung

```text
/review
```

Danach analysieren wir das Ergebnis.

---

# Kapitel 13 – Skills

Jetzt lernen wir wiederverwendbares Wissen.

Beispiel:

```text
skills/
├── react-development
├── react-testing
├── accessibility
└── api-integration
```

### React Skill

Enthält:

```text
Component conventions
Hook conventions
State management
Error handling
Performance
Accessibility
```

### Testing Skill

Enthält:

```text
Vitest
React Testing Library
Mocking
Integration testing
Test naming
Coverage
```

### Lernziel

Du verstehst den Unterschied zwischen:

```text
Agent
Command
Skill
```

---

# Kapitel 14 – Debugging

Wir erzeugen einen Fehler:

> Customer list does not refresh after editing a customer.

OpenCode:

```text
Investigate this bug.

Do not modify code yet.

Determine:

- reproduction path
- root cause
- affected components
- affected state
- API behavior
- possible regression

Then propose a fix.
```

Danach:

```text
Implement the fix.

Add a regression test.

Run all relevant tests.
```

---

# Kapitel 15 – Refactoring

Wir nehmen eine schlechte Komponente:

```text
CustomersPage.tsx
```

mit z.B. 400–500 Zeilen.

Analyse:

```text
Analyze CustomersPage.tsx.

Identify:

- responsibilities
- duplicated logic
- unnecessary state
- expensive rendering
- extraction opportunities

Do not modify anything.
```

Danach Plan:

```text
Create a refactoring plan.

Preserve all existing behavior.
```

Erst danach:

```text
Implement the refactoring.
```

---

# Kapitel 16 – React Testing

Wir erstellen Tests für:

```text
CustomersPage
UserTable
CustomerForm
CustomerDialog
SearchBox
```

Prompt:

```text
Analyze CustomersPage.

Identify missing tests for:

- loading
- success
- empty state
- error
- search
- filtering
- pagination
```

Dann:

```text
Implement the tests.

Run them.

Fix failures.
```

---

# Kapitel 17 – UI mit OpenCode

Jetzt bauen wir ein modernes Dashboard.

![Image](https://images.openai.com/static-rsc-4/CNV0cXeZ1c4ZTEZ294PUmyP-tp3pr1SYbdSr9LzGECI4-NkaiVzcXc-ZwbNDOOr5B5TShfgeTgiMTlU811K4Dkj0tT8dl-mGIOhkqUSdL2U8h6X6y345MrV4n7kV-DrvXAs0LnTpLf4LHfsLIyhqRDaXfPRzIGkrj2-jxNpv2HMl7_gSXVvUrdmq-SmYLW3A?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/GZdDQuOFrns2F2mxQoUUWOiJSS68zPfESZC0hu54o2V2qrQJQunkqBt58X2DQ4NJpKsYAe3JqX3jMpRkS9pctsbzPpcAlgvh5hOcVowDJ_VvRfwiQVUhaE8dnfudW3gEHKP0xRRyxYhkShL_sBnFhUjeqUVTg_C8tUYMRHPYh0SlcgFvEQ0eATq_RqWY9GX2?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/XQKVZELtenYPsPy5qeVYBAN7innrgJHE8eMyEve2BHXUn4tNgXQ8vinog6-jxZegZty0UaxPu6Gd82wu0404iwBxaTMpoFPZrLfCc8LOyDoJDWiipXSe8I6l7LOi3VDEf8hLjw5gO1k9zgZ63xBMkyzQkpWixxh5NCN8m5lTVyszwQ4tsb-Wy_S8ppgSPBQc?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/qnsyRvJ0CNI4I228tjE26p7qgMmRJIY0iHs1U1NyJzIi-xKMv4dAM0EoqmOwGT7uNjF9s4NKrfmSicvz9YI7eBqulVOUd8P3ABJ7XBrOV9e-N0pnWLWFKkeWjXLfvwxyjkfZ8CXRNqyCOx-hHT6D94VRAVYFipJblbnZ9bNhg83hDnZZutHGtkYjVRqZHdb2?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/Z8ZhU83MLO1cKxq5idoHEcIQMpvNKlAEZdTtCMsALLc0xl6kkw8p85wYvbkLudXa5w7ueZr-MjcLCBfOi16eA-yhTHBCaU1fOxsaWWK23JuBVPQKXrOFl26eOW4w3fcNAVUHYIPy4aCqGq5WtvCr8E3Q-MiXRyg1UJqWRQl9ixWpwAi9lindvxOL9mdHPuWc?purpose=fullsize)

![Image](https://images.openai.com/static-rsc-4/6C8PLTzF5sZEQaBBgsfucBYi-WxeRA8nfiVQNKGK6wFAKSsVNUrhyARahS8Syezwi_wjl8Tzh0oiqFtozVgfowD_wxZGkHHEkc_DwDpAPGfEAkNC33FEkzVN5z7aV6onxtWk9Lggn9l5-avFILFA2AOMOJRC4XU8PFNlh9w7JfoiaTgcrihr6jIXIynlk0X-?purpose=fullsize)

Anforderung:

```text
Create a responsive customer dashboard.

Requirements:

- responsive
- accessible
- reusable components
- dark mode
- loading states
- error states
- empty states
```

OpenCode soll zunächst analysieren:

```text
Which existing UI components
can be reused?
```

---

# Kapitel 18 – Accessibility

OpenCode überprüft:

```text
keyboard navigation
focus management
labels
buttons
ARIA
semantic HTML
contrast
forms
dialogs
```

Prompt:

```text
Perform an accessibility review.

Do not modify code.

Identify issues and prioritize them
by severity.
```

Danach:

```text
Fix the high-priority accessibility issues.

Add tests where appropriate.
```

---

# Kapitel 19 – Performance

Wir untersuchen:

```text
useEffect
useMemo
useCallback
React.memo
large lists
rendering
network requests
TanStack Query
```

Prompt:

```text
Analyze CustomersPage for performance issues.

Do not optimize blindly.

For every issue explain:

- root cause
- impact
- recommended solution
```

Dann entscheiden wir gemeinsam, was tatsächlich optimiert werden soll.

---

# Kapitel 20 – Security

Security Review:

```text
Perform a security review.

Check:

- XSS
- dangerouslySetInnerHTML
- authentication
- authorization
- token handling
- secrets
- environment variables
- API exposure
- user input
- dependencies
```

Wichtig:

> OpenCode unterstützt den Security Review, ersetzt aber keinen professionellen Security Audit.

---

# Kapitel 21 – Environment & Secrets

Wir untersuchen:

```text
.env
.env.local
.env.production
```

und:

```text
API_KEY
DATABASE_URL
JWT_SECRET
```

Regeln:

```text
Never expose secrets.

Never commit secrets.

Never print credentials.

Never hardcode API keys.
```

OpenCode bekommt:

```text
Search the repository for potential
hardcoded secrets.

Do not expose the actual secret values.

Report only file and line information.
```

---

# Kapitel 22 – Git Workflow

Unser Workflow:

```text
git status
      ↓
OpenCode
      ↓
Implement
      ↓
Test
      ↓
Review
      ↓
git diff
      ↓
Commit
```

Prompt:

```text
Review my current git diff.

Check for:

- unrelated changes
- debugging code
- unused imports
- incomplete implementation
- breaking changes
- missing tests
```

Danach:

```text
Create a conventional commit message
for the changes.
```

---

# Kapitel 23 – GitHub Workflow

Wir simulieren ein echtes Team.

```text
GitHub Issue
     ↓
OpenCode
     ↓
Plan
     ↓
Implementation
     ↓
Tests
     ↓
Review
     ↓
Pull Request
     ↓
CI
```

Issue:

```text
Add server-side customer search.

Requirements:

- name search
- email search
- debounce
- pagination
- loading state
- error handling
```

OpenCode erstellt zunächst einen Plan.

---

# Kapitel 24 – MCP

Jetzt gehen wir in den Advanced-Bereich.

Wir lernen:

**Model Context Protocol**

Prinzip:

```text
                 OpenCode
                    │
          ┌─────────┼─────────┐
          │         │         │
         MCP       MCP       MCP
          │         │         │
       GitHub     Docs     Database
```

MCP ermöglicht zusätzliche externe Tools und Datenquellen.

Wir diskutieren:

* MCP Server
* MCP Tools
* MCP Resources
* Security
* Permissions
* Use Cases

---

# Kapitel 25 – Multi-Agent Development

Jetzt kombinieren wir unsere Agents.

```text
Requirement
     ↓
Architect
     ↓
Developer
     ↓
Tester
     ↓
Reviewer
     ↓
Security
     ↓
Performance
```

Beispiel:

```text
Architect:
Create implementation plan.
```

↓

```text
Developer:
Implement the plan.
```

↓

```text
Tester:
Create missing tests.
```

↓

```text
Reviewer:
Find problems.
```

↓

```text
Security:
Perform security review.
```

---

# Kapitel 26 – Model Selection

Jetzt untersuchen wir verschiedene Modelle.

Nicht jede Aufgabe benötigt dasselbe Modell.

| Aufgabe             | Modelltyp         |
| ------------------- | ----------------- |
| Architektur         | starkes Reasoning |
| komplexes Debugging | Reasoning         |
| einfache Änderung   | schnelles Modell  |
| Dokumentation       | schnelles Modell  |
| Code Review         | starkes Modell    |
| Refactoring         | Coding/Reasoning  |

Wir untersuchen:

* Qualität
* Geschwindigkeit
* Kosten
* Kontext
* Reasoning
* Coding Performance

---

# Kapitel 27 – Permissions

Jetzt wird es sicherheitskritisch.

Wir definieren:

```text
Was darf OpenCode?

Was darf OpenCode nicht?

Welche Commands benötigen Bestätigung?

Welche Dateien dürfen verändert werden?
```

Besonders kritisch:

```text
.env
production
database
credentials
deployment
```

Ziel:

> Ein Agent soll niemals unkontrolliert kritische Aktionen ausführen.

---

# Kapitel 28 – Dokumentation

OpenCode erzeugt:

```text
README.md
ARCHITECTURE.md
CONTRIBUTING.md
API.md
```

Prompt:

```text
Analyze the complete application.

Create ARCHITECTURE.md.

Document:

- folder structure
- architecture
- routing
- state management
- API communication
- authentication
- testing
- deployment
```

Danach:

```text
Review the documentation
against the actual source code.

Identify inconsistencies.
```

---

# Kapitel 29 – Migration

Jetzt simulieren wir eine echte Enterprise-Aufgabe.

Zum Beispiel:

```text
Old architecture
       ↓
New architecture
```

OpenCode:

```text
Analyze the current architecture.

Identify:

- deprecated APIs
- breaking changes
- dependencies
- migration risks
- affected files

Create a migration plan.

Do not modify anything.
```

Dann:

```text
Implement migration step 1.

Run:

- tests
- lint
- build
```

Danach erst Schritt 2.

---

# Kapitel 30 – Abschlussprojekt

Jetzt kombinieren wir **alles**.

## Business Requirement

> Wir benötigen ein vollständiges Customer Management System.

Features:

```text
Authentication
Dashboard
Customers
Search
Filtering
Pagination
Details
Create
Edit
Delete
Notifications
Error handling
Loading states
Responsive UI
Accessibility
Tests
Security
Documentation
```

Aber wir geben OpenCode **nicht**:

```text
Build everything.
```

Stattdessen:

```text
                REQUIREMENT
                     │
                     ▼
                 ANALYSIS
                     │
                     ▼
                  ARCHITECT
                     │
                     ▼
                    PLAN
                     │
                     ▼
                 DEVELOPER
                     │
                     ▼
                   TESTER
                     │
                     ▼
                  REVIEWER
                     │
                     ▼
                  SECURITY
                     │
                     ▼
                PERFORMANCE
                     │
                     ▼
               DOCUMENTATION
                     │
                     ▼
                    GIT
                     │
                     ▼
                  GITHUB
```

---

# Das Ergebnis nach Kapitel 30

Du hast anschließend ein OpenCode-Setup ungefähr nach diesem Prinzip:

```text
customer-management/
│
├── .opencode/
│   │
│   ├── agents/
│   │   ├── architect
│   │   ├── developer
│   │   ├── tester
│   │   ├── reviewer
│   │   ├── security
│   │   └── performance
│   │
│   ├── commands/
│   │   ├── feature
│   │   ├── review
│   │   ├── test
│   │   ├── refactor
│   │   ├── security
│   │   └── performance
│   │
│   └── skills/
│       ├── react-development
│       ├── testing
│       ├── accessibility
│       └── api-integration
│
├── src/
│   ├── app/
│   ├── features/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── lib/
│
├── tests/
│
├── AGENTS.md
├── README.md
├── ARCHITECTURE.md
└── package.json
```

## Dein endgültiger Workflow

```text
                 YOU
                  │
                  ▼
            Requirement
                  │
                  ▼
              OpenCode
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    Architect  Developer  Tester
        │         │         │
        └─────────┼─────────┘
                  ▼
               Review
                  │
                  ▼
              Security
                  │
                  ▼
             Performance
                  │
                  ▼
                Git
                  │
                  ▼
              GitHub / CI
```

Der zentrale Gedanke des gesamten Workshops lautet:

> **OpenCode schreibt nicht einfach Code für dich. Du lernst, einen AI-Agenten so zu steuern, dass er innerhalb deiner Architektur, Regeln, Tests und Entwicklungsprozesse arbeitet.**

Für deinen Hintergrund würde ich als nächsten Schritt daraus ein **richtiges Workshop-Skript** machen: **Kapitel 1–30 jeweils mit Lernziel, Theorie, Vorbereitung, exakten OpenCode-Prompts, erwarteter Ausgabe, praktischer Aufgabe, Lösung und „Senior Developer Tips“**. Das wäre dann ein vollständiger Kurs, den du direkt neben deinem React-Projekt durcharbeiten kannst.
