---
name: Vegapunk Documentation

on:
  pull_request:
    types: [closed]
    branches: [dev]
    paths-ignore:
      - "README.md"
      - "docs/**"

if: github.event.pull_request.merged == true

engine: copilot

permissions:
  contents: read
  pull-requests: read

imports:
  - .github/agents/vegapunk.agent.md

safe-outputs:
  create-pull-request:
    title-prefix: "[docs] "
    base-branch: dev
    draft: true
    max: 1
    if-no-changes: ignore
    allowed-files:
      - README.md
      - docs/**
    protected-files:
      policy: blocked
      exclude:
        - README.md
---

# Mission de Vegapunk

Après chaque Pull Request fusionnée dans dev :

1. Examiner le code modifié par cette PR.
2. Identifier les fonctionnalités impactées.
3. Comparer le code à la documentation actuelle.
4. Mettre à jour README.md et docs/ si nécessaire.
5. Documenter les routes API, types, composants,
   modèles de données et changements d'architecture.
6. Ne jamais inventer de fonctionnalités.
7. Ne jamais modifier le code applicatif.
8. Ne jamais inclure de secrets ou données privées.

Si aucune mise à jour n'est nécessaire, ne rien créer.

Sinon, proposer une Pull Request de documentation
vers dev avec un résumé des changements.

Rédiger toute la documentation en anglais.
