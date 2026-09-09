import { createSpecialty, deleteSpecialty as removeSpecialty, getAllSpecialties, updateSpecialty } from "../../api/specialties-api.js";
import { clearMessage, renderSpecialties, resetForm, showMessage, startEditing } from "./specialties-view.js";

async function loadSpecialties(options = {}) {
    if (!options.preserveMessage) {
        clearMessage();
    }

    try {
        const specialties =
            await getAllSpecialties() || [];

        specialties.sort((first, second) =>
            (first.name || "").localeCompare(
                second.name || "",
                "es"
            )
        );

        renderSpecialties(specialties, (specialty) => startEditing(specialty), deleteSpecialty);
    } catch (error) {
        renderSpecialties([], () => {}, () => {});

        showMessage(
            error.message ||
            "No se pudieron cargar las especialidades."
        );
    }
}

async function saveSpecialty(event) {
    event.preventDefault();
    clearMessage();

    const id = document.getElementById(
        "specialty-id"
    ).value;

    const dto = {
        name: document.getElementById(
            "specialty-name"
        ).value.trim(),

        description: document.getElementById(
            "specialty-description"
        ).value.trim()
    };

    if (!dto.name) {
        showMessage(
            "Escribe el nombre de la especialidad."
        );

        return;
    }

    const saveButton = document.getElementById(
        "save-specialty"
    );

    saveButton.disabled = true;

    try {
        if (id) {
            await updateSpecialty(id, dto);

            showMessage(
                "Especialidad actualizada correctamente.",
                "success"
            );
        } else {
            await createSpecialty(dto);

            showMessage(
                "Especialidad creada correctamente.",
                "success"
            );
        }

        resetForm();

        await loadSpecialties({
            preserveMessage: true
        });
    } catch (error) {
        showMessage(
            error.message ||
            "No se pudo guardar la especialidad."
        );
    } finally {
        saveButton.disabled = false;
    }
}

async function deleteSpecialty(id, name) {
    const confirmed = window.confirm(
        `¿Seguro que deseas eliminar la especialidad "${name}"?`
    );

    if (!confirmed) {
        return;
    }

    clearMessage();

    try {
        await removeSpecialty(id);

        if (
            document.getElementById(
                "specialty-id"
            ).value === id
        ) {
            resetForm();
        }

        showMessage(
            "Especialidad eliminada correctamente.",
            "success"
        );

        await loadSpecialties({
            preserveMessage: true
        });
    } catch (error) {
        showMessage(
            error.message ||
            "No se pudo eliminar la especialidad."
        );
    }
}

window.sgcmSpecialties = {
    getAll: getAllSpecialties,
    create: createSpecialty,
    update: updateSpecialty,
    remove: removeSpecialty
};

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            document.body.dataset.page !==
            "specialties-admin"
        ) {
            return;
        }

        document
            .getElementById("specialty-form")
            .addEventListener(
                "submit",
                saveSpecialty
            );

        document
            .getElementById("cancel-edit")
            .addEventListener(
                "click",
                resetForm
            );

        loadSpecialties();
    }
);