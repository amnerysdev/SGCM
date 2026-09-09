export function showMessage(message, type = "error") {
    const element = document.getElementById(
        "specialty-message"
    );

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `message visible ${type}`;
}

export function clearMessage() {
    const element = document.getElementById(
        "specialty-message"
    );

    if (!element) {
        return;
    }

    element.textContent = "";
    element.className = "message";
}

export function resetForm() {
    const form = document.getElementById(
        "specialty-form"
    );

    form.reset();

    document.getElementById(
        "specialty-id"
    ).value = "";

    document.getElementById(
        "form-title"
    ).textContent = "Nueva especialidad";

    document.getElementById(
        "save-specialty"
    ).textContent = "Guardar";

    document.getElementById(
        "cancel-edit"
    ).hidden = true;
}

export function startEditing(specialty) {
    if (!specialty) {
        return;
    }

    document.getElementById(
        "specialty-id"
    ).value = specialty.id;

    document.getElementById(
        "specialty-name"
    ).value = specialty.name || "";

    document.getElementById(
        "specialty-description"
    ).value = specialty.description || "";

    document.getElementById(
        "form-title"
    ).textContent = "Editar especialidad";

    document.getElementById(
        "save-specialty"
    ).textContent = "Actualizar";

    document.getElementById(
        "cancel-edit"
    ).hidden = false;

    document.getElementById(
        "specialty-name"
    ).focus();
}

function createActionButton(
    label,
    className,
    onClick
) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = className;
    button.textContent = label;
    button.addEventListener("click", onClick);

    return button;
}

export function renderSpecialties(specialties, onEdit, onDelete) {
    const tableBody = document.getElementById(
        "specialties-body"
    );

    tableBody.replaceChildren();

    if (specialties.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 3;
        cell.className = "empty-state";
        cell.textContent =
            "Todavía no hay especialidades registradas.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;
    }

    specialties.forEach(specialty => {
        const row = document.createElement("tr");

        const nameCell =
            document.createElement("td");

        const descriptionCell =
            document.createElement("td");

        const actionsCell =
            document.createElement("td");

        const actions =
            document.createElement("div");

        nameCell.textContent =
            specialty.name;

        descriptionCell.textContent =
            specialty.description ||
            "Sin descripción";

        actions.className = "row-actions";

        actions.append(
            createActionButton(
                "Editar",
                "edit-button",
                () => onEdit(specialty)
            ),
            createActionButton(
                "Eliminar",
                "delete-button",
                () => onDelete(
                    specialty.id,
                    specialty.name
                )
            )
        );

        actionsCell.appendChild(actions);

        row.append(
            nameCell,
            descriptionCell,
            actionsCell
        );

        tableBody.appendChild(row);
    });
}