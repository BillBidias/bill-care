# Workshop: Der `.github`-Ordner in einem React-Projekt

**Dauer:** ca. 60–90 Minuten
**Zielgruppe:** React-Entwickler:innen mit Grundkenntnissen in Git/GitHub
**Voraussetzungen:** Ein React-Projekt (z. B. mit Vite oder Create React App erstellt), ein GitHub-Repository, grundlegendes Verständnis von npm/yarn

---

## 1. Lernziele

Nach diesem Workshop kannst du:

- erklären, wofür der `.github`-Ordner genutzt wird
- eine GitHub-Actions-Workflow-Datei für CI (Lint, Test, Build) schreiben
- Issue- und Pull-Request-Templates anlegen
- eine `CODEOWNERS`-Datei und Dependabot-Konfiguration einrichten
- den kompletten Ordner sinnvoll für ein reales React-Projekt strukturieren

---

## 2. Theorie: Was gehört in `.github`?

Der `.github`-Ordner liegt im Root deines Repos und wird von GitHub automatisch erkannt. Typische Inhalte:

```
.github/
├── workflows/
│   ├── ci.yml
│   └── deploy.yml
├── ISSUE_TEMPLATE/
│   ├── bug_report.md
│   └── feature_request.md
├── PULL_REQUEST_TEMPLATE.md
├── CODEOWNERS
├── dependabot.yml
└── FUNDING.yml
```

| Datei/Ordner | Zweck |
|---|---|
| `workflows/*.yml` | GitHub Actions – CI/CD-Pipelines (Lint, Test, Build, Deploy) |
| `ISSUE_TEMPLATE/` | Vorlagen, die beim Erstellen eines Issues angezeigt werden |
| `PULL_REQUEST_TEMPLATE.md` | Vordefinierte Struktur für PR-Beschreibungen |
| `CODEOWNERS` | Definiert, wer bei Änderungen an bestimmten Dateien automatisch als Reviewer vorgeschlagen wird |
| `dependabot.yml` | Automatische Dependency-Updates konfigurieren |
| `FUNDING.yml` | Sponsoring-Links (z. B. für Open-Source-Projekte) |

Für ein **React-Projekt** ist der wichtigste Teil in der Praxis der **CI-Workflow**: Bei jedem Push/PR sollen automatisch Linting, Tests und ein Production-Build laufen, damit fehlerhafter Code gar nicht erst gemerged wird.

---

## 3. Übung

**Aufgabe:** Richte für ein bestehendes React-Projekt (Vite + TypeScript, npm) folgendes ein:

1. Einen GitHub-Actions-Workflow (`.github/workflows/ci.yml`), der bei jedem `push` und `pull_request` auf den Branch `main`:
   - Node.js installiert (Version 20)
   - Dependencies installiert (`npm ci`)
   - Linting ausführt (`npm run lint`)
   - Tests ausführt (`npm run test`)
   - einen Production-Build erstellt (`npm run build`)
2. Ein Issue-Template für Bugs (`bug_report.md`)
3. Ein Pull-Request-Template mit einer Checkliste (Tests grün, Doku aktualisiert, Screenshots bei UI-Änderungen)
4. Eine `dependabot.yml`, die wöchentlich nach npm-Updates sucht

**Zusatzaufgabe (optional):** Erweitere den Workflow um einen Matrix-Build, der auf Node 18 **und** 20 läuft.

Versuch es zuerst selbst, bevor du dir die Lösung unten anschaust!

---

## 4. Lösung

### 4.1 `.github/workflows/ci.yml`

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Code auschecken
        uses: actions/checkout@v4

      - name: Node.js einrichten
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"

      - name: Dependencies installieren
        run: npm ci

      - name: Linting
        run: npm run lint

      - name: Tests ausführen
        run: npm run test -- --run

      - name: Production-Build
        run: npm run build
```

**Erklärung der wichtigsten Punkte:**
- `npm ci` statt `npm install`: reproduzierbare Installation basierend exakt auf `package-lock.json`, schneller und sicherer für CI.
- `cache: "npm"` beschleunigt nachfolgende Runs, da der npm-Cache zwischengespeichert wird.
- `--run` bei Vitest verhindert, dass Tests im Watch-Modus hängen bleiben (bei Jest ist das nicht nötig).

### 4.2 Zusatzaufgabe – Matrix-Build

```yaml
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]

    steps:
      - uses: actions/checkout@v4

      - name: Node.js ${{ matrix.node-version }} einrichten
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --run
      - run: npm run build
```

Der Job läuft dadurch zweimal parallel – einmal je Node-Version.

### 4.3 `.github/ISSUE_TEMPLATE/bug_report.md`

```markdown
---
name: Bug Report
about: Melde einen Fehler im Projekt
title: "[BUG] "
labels: bug
assignees: ""
---

## Beschreibung
Kurze, klare Beschreibung des Fehlers.

## Schritte zur Reproduktion
1. Gehe zu '...'
2. Klicke auf '...'
3. Fehler tritt auf

## Erwartetes Verhalten
Was hättest du erwartet?

## Screenshots
Falls zutreffend, füge Screenshots hinzu.

## Umgebung
- Browser: [z. B. Chrome 128]
- OS: [z. B. Windows 11]
- App-Version/Commit: [z. B. v1.2.0]
```

### 4.4 `.github/PULL_REQUEST_TEMPLATE.md`

```markdown
## Was wurde geändert?
Kurze Beschreibung der Änderungen.

## Warum?
Bezug zu Issue/Ticket (z. B. Closes #42)

## Checkliste
- [ ] Tests laufen lokal grün
- [ ] Neue/veränderte Funktionalität ist getestet
- [ ] Dokumentation wurde aktualisiert
- [ ] Bei UI-Änderungen: Screenshots angehängt
```

### 4.5 `.github/dependabot.yml`

```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 5
```

---

## 5. Bonus: Deploy-Workflow (z. B. auf GitHub Pages)

Falls dein React-Projekt auf GitHub Pages deployed werden soll, kannst du folgenden zweiten Workflow ergänzen:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v4
```

---

## 6. Zusammenfassung

| Was | Wofür |
|---|---|
| `workflows/ci.yml` | Automatisches Lint/Test/Build bei jedem Push/PR |
| `workflows/deploy.yml` | Automatisches Deployment (z. B. GitHub Pages) |
| `ISSUE_TEMPLATE/` | Konsistente, vollständige Bug-Reports |
| `PULL_REQUEST_TEMPLATE.md` | Einheitliche PR-Qualität durch Checkliste |
| `dependabot.yml` | Automatische Security- und Versions-Updates |
| `CODEOWNERS` | Automatische Review-Zuweisung |

**Nächster Schritt:** Kopiere die Dateien in dein Projekt, passe Skript-Namen (`lint`, `test`, `build`) an deine `package.json` an und teste den Workflow mit einem Test-PR.
