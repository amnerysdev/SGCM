import { getSession } from "./shared/session.js";
import { createPatient, deletePatient, getAllPatients, getCurrentPatient, getPatientById, updatePatient } from "./api/patients-api.js";
import { calculateInitials, setProfileText, setupProfileRetry, showProfileMessage } from "./components/profile-view.js";

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

        const patient = await getCurrentPatient();

        const fullName =
            session.fullName || "Paciente";

        const email =
            session.email || "No disponible";

        setProfileText("patient-name", fullName);
        setProfileText("patient-email", email);
        setProfileText(
            "patient-ssn",
            patient.socialSecurityNumber
        );
        setProfileText(
            "patient-dob",
            formatDate(patient.dateOfBirth)
        );
        setProfileText("patient-address", patient.address);
        setProfileText("patient-id", patient.id);
        setProfileText(
            "patient-initials",
            calculateInitials(fullName) || "PA"
        );

        showProfileMessage(
            "Perfil cargado correctamente.",
            "success"
        );
    } catch (error) {
        showProfileMessage(
            error.message ||
            "No se pudo cargar el perfil del paciente."
        );

        if (retryButton) {
            retryButton.hidden = false;
        }
    }
}

window.sgcmPatients = {
    getAll: getAllPatients,
    getById: getPatientById,
    getCurrent: getCurrentPatient,
    create: createPatient,
    update: updatePatient,
    remove: deletePatient
};

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            document.body.dataset.page !==
            "patient-profile"
        ) {
            return;
        }

        setupProfileRetry(loadPatientProfile);

        loadPatientProfile();
    }
);