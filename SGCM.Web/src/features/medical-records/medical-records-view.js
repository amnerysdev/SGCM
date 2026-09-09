export function showMessage(message, type = "error") {
    const element = document.getElementById(
        "record-message"
    );

    if (!element) {
        return;
    }

    element.textContent = message;
    element.className = `message visible ${type}`;
}

export function formatDateTime(value) {
    if (!value) {
        return "No disponible";
    }

    return new Date(value).toLocaleString("es-DO", {
        dateStyle: "medium",
        timeStyle: "short"
    });
}

export function renderRecords(records) {
    const list = document.getElementById("records-list");

    list.replaceChildren();

    if (!records.length) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent =
            "Todavía no tienes expedientes registrados.";
        list.append(empty);
        return;
    }

    records
        .slice()
        .sort(
            (first, second) =>
                new Date(second.creationDate) -
                new Date(first.creationDate)
        )
        .forEach(record => {
            const card = document.createElement("article");
            card.className = "record-card";

            const date = document.createElement("p");
            date.className = "record-date";
            date.textContent = formatDateTime(
                record.creationDate
            );
            card.append(date);

            const dl = document.createElement("dl");

            const fields = [
                ["Diagnóstico", record.diagnosis],
                ["Tratamiento", record.treatment],
                ["Notas", record.notes || "Sin notas"],
                ["Cita relacionada", record.appointmentId]
            ];

            fields.forEach(([label, value]) => {
                const dt = document.createElement("dt");
                dt.textContent = label;

                const dd = document.createElement("dd");
                dd.textContent = value || "No disponible";

                dl.append(dt, dd);
            });

            card.append(dl);
            list.append(card);
        });
}