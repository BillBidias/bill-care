# Allgemeine:

Theorie: Was .github ist und welche Dateien/Ordner typischerweise reingehören
Übung: CI-Workflow, Issue-Template, PR-Template und Dependabot-Konfiguration selbst schreiben
Lösung: Fertige ci.yml (mit Lint, Test, Build), Matrix-Build als Bonus, Issue-/PR-Templates, dependabot.yml
Bonus: Ein Deploy-Workflow für GitHub Pages


# Was	Wofür
- workflows/ci.yml	Automatisches Lint/Test/Build bei jedem Push/PR
- workflows/deploy.yml	Automatisches Deployment (z. B. auf Vercel: Preview per PR, Production bei Push auf main)
- ISSUE_TEMPLATE/	Konsistente, vollständige Bug-Reports
- PULL_REQUEST_TEMPLATE.md	Einheitliche PR-Qualität durch Checkliste
- dependabot.yml	Automatische Security- und Versions-Updates
- CODEOWNERS	Automatische Review-Zuweisung