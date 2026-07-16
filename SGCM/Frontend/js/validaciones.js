document.addEventListener("DOMContentLoaded", () => {

    const formularios = document.querySelectorAll("form");

    formularios.forEach(formulario => {

        formulario.addEventListener("submit", function (e) {

            const passwords = this.querySelectorAll('input[type="password"]');

            if (passwords.length >= 2) {

                const password = passwords[0].value;
                const confirmPassword = passwords[1].value;

                if (password !== confirmPassword) {

                    e.preventDefault();

                    alert("Las contraseñas no coinciden.");
                }
            }
        });
    });
});