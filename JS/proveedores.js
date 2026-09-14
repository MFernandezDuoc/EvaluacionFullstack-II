/* ============================================================
   EventosPro - proveedores.js
   Lógica para coordinacionProveedores.html:
   - Los proveedores pueden confirmar o rechazar un servicio.
   - El estado se guarda en localStorage y se mantiene al recargar.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const tarjetas = document.querySelectorAll("[data-servicio-id]");

    function pintarTarjeta(card, estado) {
        const header = card.querySelector(".card-header");
        const body = card.querySelector(".card-body");
        let acciones = body.querySelector(".acciones-proveedor");

        card.classList.remove("border-warning", "border-success", "border-danger");
        header.classList.remove("bg-warning", "text-dark", "bg-success", "text-white", "bg-danger");

        if (estado === "confirmado") {
            card.classList.add("border-success");
            header.classList.add("bg-success", "text-white");
            header.textContent = "Confirmado";
        } else if (estado === "rechazado") {
            card.classList.add("border-danger");
            header.classList.add("bg-danger", "text-white");
            header.textContent = "Rechazado";
        } else {
            card.classList.add("border-warning");
            header.classList.add("bg-warning", "text-dark");
            header.textContent = "Pendiente de Confirmación";
        }

        if (acciones) {
            if (estado === "confirmado" || estado === "rechazado") {
                acciones.innerHTML = `<div class="alert alert-secondary mb-0 text-center w-100" role="alert">Servicio ${estado === "confirmado" ? "Confirmado" : "Rechazado"}</div>`;
            }
        }
    }

    tarjetas.forEach(card => {
        const servicioId = card.dataset.servicioId;
        const estadoGuardado = EventosProData.getEstadoProveedor(servicioId);
        if (estadoGuardado) pintarTarjeta(card, estadoGuardado);

        const btnConfirmar = card.querySelector('[data-accion="confirmar"]');
        const btnRechazar = card.querySelector('[data-accion="rechazar"]');

        if (btnConfirmar) {
            btnConfirmar.addEventListener("click", () => {
                EventosProData.setEstadoProveedor(servicioId, "confirmado");
                pintarTarjeta(card, "confirmado");
            });
        }
        if (btnRechazar) {
            btnRechazar.addEventListener("click", () => {
                EventosProData.setEstadoProveedor(servicioId, "rechazado");
                pintarTarjeta(card, "rechazado");
            });
        }
    });
});
