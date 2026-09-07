import { getSession } from "./api.js";
import { requestJson } from "./api/http-client.js";

const PATIENTS_URL = "/api/patients";

const patientApi = {
    getAll: () =>
        requestJson(PATIENTS_URL, {}, "Debes iniciar sesión para consultar el perfil."),

    getById: id =>
        requestJson(
            `${PATIENTS_URL}/${encodeURIComponent(id)}`
        ),

    getCurrent: () =>
        requestJson(`${PATIENTS_URL}/me`, {}, "Debes iniciar sesión para consultar el perfil."),

    create: dto =>
        requestJson(PATIENTS_URL, {
            method: "POST",
            body: JSON.stringify(dto)
        }),

    update: (id, dto) =>
        requestJson(
            `${PATIENTS_URL}/${encodeURIComponent(id)}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    ...dto,
                    id
                })
            }
        ),

    remove: id =>
        requestJson(
            `${PATIENTS_URL}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        )
};

function setText(elementId, value) {
    const element = document.getElementById(elementId);

    if (!element) {
        return;
    }

    element.textContent = value || "No disponible";
    element.classList.remove("loading");
}

function showMessage(message, type = "error") {
    const element = document.getElementById(
        "profile-message"
    );

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `message visible ${type}`;
}

function calculateInitials(name) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("");
}

function formatDate(value) {
    if (!value) {
        return "No disponible";
    }

    return new Date(value).toLocaleDateString("es-DO", {
        year: "numeric",
        month: "long",
        day: "numeric"
    });
}

async function loadPatientProfile() {
    const retryButton = document.getElementById(
        "retry-profile"
    );

    if (retryButton) {
        retryButton.hidden = true;
    }

    try {
        const session = getSession();

        if (!session) {
            throw new Error(
                "Debes iniciar sesión para consultar el perfil."
            );
        }

        const patient = await patientApi.getCurrent();

        const fullName =
            session.fullName || "Paciente";

        const email =
            session.email || "No disponible";

        setText("patient-name", fullName);
        setText("patient-email", email);
        setText(
            "patient-ssn",
            patient.socialSecurityNumber
        );
        setText(
            "patient-dob",
            formatDate(patient.dateOfBirth)
        );
        setText("patient-address", patient.address);
        setText("patient-id", patient.id);
        setText(
            "patient-initials",
            calculateInitials(fullName) || "PA"
        );

        showMessage(
            "Perfil cargado correctamente.",
            "success"
        );
    } catch (error) {
        showMessage(
            error.message ||
            "No se pudo cargar el perfil del paciente."
        );

        if (retryButton) {
            retryButton.hidden = false;
        }
    }
}

window.sgcmPatients = patientApi;

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            document.body.dataset.page !==
            "patient-profile"
        ) {
            return;
        }

        document
            .getElementById("retry-profile")
            ?.addEventListener(
                "click",
                loadPatientProfile
            );

        loadPatientProfile();
    }
);
