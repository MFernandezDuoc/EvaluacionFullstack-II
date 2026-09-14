/* ============================================================
   EventosPro - auth.js
   Login y registro simulados con localStorage (sin backend real).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    // --- Registro de nuevo cliente (registroUsers.html) ---
    const regPass = document.getElementById("regPass");
    if (regPass) {
        const form = regPass.closest("form");
        const regNombre = document.getElementById("regNombre");
        const regEmail = document.getElementById("regEmail");
        const regEmpresa = document.getElementById("regEmpresa");
        const regPassConfirm = document.getElementById("regPassConfirm");
        const termsCheck = document.getElementById("termsCheck");

        form.addEventListener("submit", (e) => {
            e.preventDefault();

            if (!regNombre.value.trim() || !regEmail.value.trim() || !regPass.value) {
                alert("Por favor completa todos los campos obligatorios.");
                return;
            }
            if (regPass.value.length < 6) {
                alert("La contraseña debe tener al menos 6 caracteres.");
                return;
            }
            if (regPass.value !== regPassConfirm.value) {
                alert("Las contraseñas no coinciden.");
                return;
            }
            if (!termsCheck.checked) {
                alert("Debes aceptar los términos y políticas de confidencialidad.");
                return;
            }

            EventosProData.agregarUsuario({
                nombre: regNombre.value.trim(),
                empresa: regEmpresa.value.trim(),
                email: regEmail.value.trim()
                // Nota: en un sistema real, la contraseña nunca se guarda en texto plano
                // ni en localStorage. Esto es solo una simulación de frontend.
            });

            alert("¡Cuenta creada con éxito! Ahora puedes iniciar sesión.");
            window.location.href = "main.html";
        });
    }

    // --- Login administrativo (adminLogins.html) ---
    const adminUser = document.getElementById("adminUser");
    if (adminUser) {
        const form = adminUser.closest("form");
        const adminPass = document.getElementById("adminPass");
        const adminKey = document.getElementById("adminKey");

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!adminUser.value.trim() || !adminPass.value || !adminKey.value.trim()) {
                alert("Por favor completa todos los campos para ingresar.");
                return;
            }
            // Simulación de acceso: no valida contra un backend real.
            window.location.href = "gestionEventos.html";
        });
    }
});
