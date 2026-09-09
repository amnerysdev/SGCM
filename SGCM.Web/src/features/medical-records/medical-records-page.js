import { getSession } from "../../shared/session.js";
import { getCurrentDoctor } from "../../api/profile-api.js";
import { getCurrentPatient } from "../../api/profile-api.js";
import { createMedicalRecord, getRecordsByPatient } from "../../api/medical-records-api.js";
import { renderRecords, showMessage } from "./medical-records-view.js";

async function loadPatientRecords() {
    const panel = document.getElementById("patient-panel");
    panel.hidden = false;

    try {
        const patient = await getCurrentPatient();
        const records = await getRecordsByPatient(
            patient.id
        );

        renderRecords(records || []);
    } catch (error) {
        renderRecords([]);

        showMessage(
            error.message ||
            "No se pudieron cargar tus expedientes."
        );
    }
}

async function setupDoctorPanel() {
    const panel = document.getElementById("doctor-panel");
    panel.hidden = false;

    let doctor;

    try {
        doctor = await getCurrentDoctor();
    } catch (error) {
        showMessage(
            error.message ||
            "No se pudo identificar tu perfil médico."
        );
        return;
    }

    document
        .getElementById("record-form")
        .addEventListener("submit", async event => {
            event.preventDefault();

            const dto = {
                appointmentId: document
                    .getElementById("appointment-id")
                    .value.trim(),

                patientId: document
                    .getElementById("patient-id")
                    .value.trim(),

                doctorId: doctor.id,

                diagnosis: document
                    .getElementById("diagnosis")
                    .value.trim(),

                treatment: document
                    .getElementById("treatment")
                    .value.trim(),

                notes: document
                    .getElementById("notes")
                    .value.trim()
            };

            const saveButton = document.getElementById(
                "save-record"
            );

            saveButton.disabled = true;

            try {
                await createMedicalRecord(dto);

                document
                    .getElementById("record-form")
                    .reset();

                showMessage(
                    "Expediente guardado correctamente.",
                    "success"
                );
            } catch (error) {
                showMessage(
                    error.message ||
                    "No se pudo guardar el expediente."
                );
            } finally {
                saveButton.disabled = false;
            }
        });
}

async function init() {
    const session = getSession();

    if (!session) {
        showMessage(
            "Debes iniciar sesión para ver esta página."
        );
        return;
    }

    const roles = session.roles || [];
    const tasks = [];

    if (roles.includes("Doctor")) {
        tasks.push(setupDoctorPanel());
    }

    if (roles.includes("Patient")) {
        tasks.push(loadPatientRecords());
    }

    if (!tasks.length) {
        showMessage(
            "Tu perfil no tiene acceso a los expedientes médicos."
        );
        return;
    }

    await Promise.all(tasks);
}

window.sgcmMedicalRecords = { getByPatient: getRecordsByPatient, create: createMedicalRecord };

document.addEventListener("DOMContentLoaded", () => {
    if (document.body.dataset.page !== "medical-records") {
        return;
    }

    init();
});