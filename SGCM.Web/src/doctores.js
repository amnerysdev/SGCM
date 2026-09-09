import { getSession } from "./shared/session.js";
import { createDoctor, deleteDoctor, getAllDoctors, getCurrentDoctor, getDoctorById, getDoctorsBySpecialty, updateDoctor } from "./api/doctors-api.js";
import { getSpecialty } from "./api/catalog-api.js";
import { calculateInitials, setProfileText, setupProfileRetry, showProfileMessage } from "./components/profile-view.js";

async function loadDoctorProfile() {
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

        const doctor = await getCurrentDoctor();

        let specialtyName = "No asignada";

        if (doctor.specialtyId) {
            const specialty = await getSpecialty(
                doctor.specialtyId
            );

            specialtyName =
                specialty.name || specialtyName;
        }

        const fullName =
            session.fullName || "Doctor";

        const email =
            session.email || "No disponible";

        setProfileText("doctor-name", fullName);
        setProfileText("doctor-email", email);
        setProfileText(
            "doctor-license",
            doctor.medicalLicense
        );
        setProfileText(
            "doctor-specialty",
            specialtyName
        );
        setProfileText("doctor-id", doctor.id);
        setProfileText(
            "doctor-initials",
            calculateInitials(fullName) || "DR"
        );

        showProfileMessage(
            "Perfil cargado correctamente.",
            "success"
        );
    } catch (error) {
        showProfileMessage(
            error.message ||
            "No se pudo cargar el perfil del doctor."
        );

        if (retryButton) {
            retryButton.hidden = false;
        }
    }
}

window.sgcmDoctors = {
    getAll: getAllDoctors,
    getById: getDoctorById,
    getBySpecialty: getDoctorsBySpecialty,
    getCurrent: getCurrentDoctor,
    create: createDoctor,
    update: updateDoctor,
    remove: deleteDoctor
};

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            document.body.dataset.page !==
            "doctor-profile"
        ) {
            return;
        }

        setupProfileRetry(loadDoctorProfile);

        loadDoctorProfile();
    }
);