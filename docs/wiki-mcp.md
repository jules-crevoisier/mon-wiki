# MCP - Wiki collaboratif (base BookStack / Notion / Outline)

## Vision

Construire un wiki orienté knowledge management avec une navigation rapide par workspace, sujet, page et section, et une edition markdown moderne.

## Experience utilisateur cible

- Page d'accueil configurable avec vues `blocs`, `liste`, ou `personnalisee`.
- Recherche globale de sujets et pages.
- Lecture markdown optimisee.
- Bascule en mode editeur lors de la modification.
- Navigation persistante:
  - Workspaces (`dev`, `infra`, `front`, ...).
  - Accueil, Recherche, Sujets.
  - Derniers consultes et Favoris.
  - Arborescence du projet ouvert: `Sujet -> Page -> Section`.
- Header avec breadcrumb cliquable pour remonter rapidement la hierarchie.
- Menu compte: `Account`, `Settings`, `Log out`.
- Settings: theme `light`, `dark`, `system`.

## Modele fonctionnel (MVP)

### Entites

- Workspace
  - id, name, slug
- Sujet
  - id, workspace_id, title, slug, is_favorite
- Page
  - id, sujet_id, title, slug, content_markdown, last_viewed_at
- Section
  - id, page_id, title, anchor

### Relations

- Un workspace contient plusieurs sujets.
- Un sujet contient une ou plusieurs pages.
- Une page contient une ou plusieurs sections.

## Navigation et ecrans

1. `Accueil`
   - widgets sujets recents, favoris, activite.
   - switch de vue (blocs/liste/personnalisee).
2. `Recherche`
   - champ global, filtres workspace/sujet/type.
3. `Sujet`
   - liste de pages du sujet.
4. `Page`
   - mode lecture markdown.
   - mode edition (BlockNote ou editeur markdown).

## Architecture technique proposee

- App Router Next.js.
- Sidebar composee de:
  - Workspace switcher.
  - Nav principale (`Accueil`, `Recherche`, `Sujets` + recents/favoris).
  - Projet ouvert (`Sujet -> Page -> Section`).
  - Menu utilisateur (account/settings/theme/logout).
- Header global:
  - bouton sidebar.
  - breadcrumb de contexte.

## Roadmap implementation

1. **UI Foundation** (en cours)
   - sidebar alignee sur l'architecture wiki.
   - breadcrumb dans le header.
   - menu theme compte.
2. **Data Layer**
   - schema des entites (workspace/sujet/page/section).
   - endpoints de lecture.
3. **Search**
   - indexation pages/sujets.
   - resultats groupes par type.
4. **Editor Workflow**
   - mode read/edit par page.
   - sauvegarde auto et historique.
5. **Polish**
   - favoris/recents persistants.
   - permissions par workspace.

