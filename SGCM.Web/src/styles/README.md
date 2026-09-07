# CSS architecture

`style.css` remains the public stylesheet entrypoint used by every HTML page. New rules are organized under `styles/` and imported from that entrypoint.

- `settings/`: shared design tokens and CSS variables.
- `base/`: document defaults and native element rules.
- `components/`: reusable controls, feedback, cards and navigation.
- `layouts/`: page shells such as authentication, dashboard and protected app pages.
- `pages/`: rules specific to one workflow or page family.
- `utilities/`: small cross-cutting helpers and responsive rules.

New styles should be added to the narrowest responsible module. Keep page-specific selectors in `pages/`, avoid adding new inline `<style>` blocks, and preserve the import order in `style.css`.
