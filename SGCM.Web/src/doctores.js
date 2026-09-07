import { getSession } from "./api.js";
import { requestJson } from "./api/http-client.js";

const DOCTORS_URL = "/api/doctors";
const SPECIALTIES_URL = "/api/specialties";

const doctorApi = {
    getAll: () =>
        requestJson(DOCTORS_URL, {}, "Debes iniciar sesión para consultar el perfil."),

    getById: id =>
        requestJson(
            `${DOCTORS_URL}/${encodeURIComponent(id)}`
        ),

    getBySpecialty: specialtyId =>
        requestJson(
            `${DOCTORS_URL}/by-specialty/${encodeURIComponent(specialtyId)}`
        ),

    getCurrent: () =>
        requestJson(`${DOCTORS_URL}/me`, {}, "Debes iniciar sesión para consultar el perfil."),

    create: dto =>
        requestJson(DOCTORS_URL, {
            method: "POST",
            body: JSON.stringify(dto)
        }),

    update: (id, dto) =>
        requestJson(
            `${DOCTORS_URL}/${encodeURIComponent(id)}`,
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
            `${DOCTORS_URL}/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        )
};

async function getSpecialty(id) {
    return requestJson(
        `${SPECIALTIES_URL}/${encodeURIComponent(id)}`,
        {},
        "Debes iniciar sesión para consultar el perfil."
    );
}

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

        const doctor = await doctorApi.getCurrent();

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

        setText("doctor-name", fullName);
        setText("doctor-email", email);
        setText(
            "doctor-license",
            doctor.medicalLicense
        );
        setText(
            "doctor-specialty",
            specialtyName
        );
        setText("doctor-id", doctor.id);
        setText(
            "doctor-initials",
            calculateInitials(fullName) || "DR"
        );

        showMessage(
            "Perfil cargado correctamente.",
            "success"
        );
    } catch (error) {
        showMessage(
            error.message ||
            "No se pudo cargar el perfil del doctor."
        );

        if (retryButton) {
            retryButton.hidden = false;
        }
    }
}

window.sgcmDoctors = doctorApi;

document.addEventListener(
    "DOMContentLoaded",
    () => {
        if (
            document.body.dataset.page !==
            "doctor-profile"
        ) {
            return;
        }

        document
            .getElementById("retry-profile")
            ?.addEventListener(
                "click",
                loadDoctorProfile
            );

        loadDoctorProfile();
    }
);