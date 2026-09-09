# CSS architecture

`style.css` remains the public stylesheet entrypoint used by every HTML page. New rules are organized under `styles/` and imported from that entrypoint.

- `settings/`: shared design tokens and CSS variables.
- `base/`: document defaults and native element rules.
- `components/`: reusable controls, feedback, cards and navigation.
- `layouts/`: page shells such as authentication, dashboard and protected app pages.
- `pages/`: rules specific to one workflow or page family.
- `utilities/`: small cross-cutting helpers and responsive rules.

Modules currently defined:

- `settings/tokens.css`: design tokens (`:root` variables).
- `base/reset.css`: box-sizing and body defaults.
- `base/elements.css`: heading, link and label rules.
- `components/forms.css`: input, select, button, button variants and badge styles.
- `components/feedback.css`: error, success and alert message styles.
- `layouts/app-shell.css`: dashboard shell, sidebar, header and quick-links.
- `pages/auth.css`: login, register, forgot/reset password styles.
- `pages/booking.css`: booking wizard, slot grid, appointment confirmation.
- `pages/appointments.css`: availability and appointment list views.
- `pages/admin-specialties.css`: specialty admin panel.
- `pages/doctor-profile.css`: doctor profile page.
- `pages/patient-profile.css`: imports doctor-profile.css (shared layout).
- `pages/medical-records.css`: medical records page.
- `utilities/responsive.css`: shared responsive overrides.

New styles should be added to the narrowest responsible module. Keep page-specific selectors in `pages/`, avoid adding new inline `<style>` blocks, and preserve the import order in `style.css`.
