/* ============================================================
   EventosPro - reserva.js
   Lógica para solicitudReserva.html:
   - Calcula el total estimado en tiempo real.
   - Valida el formulario.
   - Detecta doble reserva de salón en la misma fecha.
   - Guarda la reserva en localStorage (vía storage.js).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const form = document.querySelector("form");
    const nombreCliente = document.getElementById("nombreCliente");
    const emailCliente = document.getElementById("emailCliente");
    const fechaEvento = document.getElementById("fechaEvento");
    const horaInicio = document.getElementById("horaInicio");
    const asistentes = document.getElementById("asistentes");
    const salonSelect = document.getElementById("salonSelect");
    const checkboxes = ["se001", "se002", "se003", "se004"].map(id => document.getElementById(id));

    if (!form || !salonSelect) return; // seguridad si el script se carga en otra página

    // --- Crear zona de total y mensajes (si no existen ya en el HTML) ---
    let resumenTotal = document.getElementById("resumenTotal");
    if (!resumenTotal) {
        resumenTotal = document.createElement("div");
        resumenTotal.id = "resumenTotal";
        resumenTotal.className = "alert alert-info d-flex justify-content-between align-items-center mt-3";
        resumenTotal.innerHTML = 'Total estimado: <strong id="totalMonto">$0</strong>';
        const botones = form.querySelector(".d-grid, .d-md-flex");
        form.insertBefore(resumenTotal, botones);
    }
    const totalMonto = document.getElementById("totalMonto");

    let mensajeReserva = document.getElementById("mensajeReserva");
    if (!mensajeReserva) {
        mensajeReserva = document.createElement("div");
        mensajeReserva.id = "mensajeReserva";
        mensajeReserva.className = "mt-3";
        form.appendChild(mensajeReserva);
    }

    function calcularTotal() {
        let total = 0;
        const salon = EventosProData.getSalonPorCodigo(salonSelect.value);
        if (salon) total += salon.precio;

        const numAsistentes = parseInt(asistentes.value, 10) || 0;

        checkboxes.forEach(cb => {
            if (!cb || !cb.checked) return;
            const codigo = cb.id.toUpperCase();
            const servicio = EventosProData.getServicioPorCodigo(codigo);
            if (!servicio) return;
            if (servicio.tipo === "porPersona") {
                total += servicio.precio * numAsistentes;
            } else {
                total += servicio.precio;
            }
        });

        totalMonto.textContent = EventosProData.formatoCLP(total);
        return total;
    }

    [salonSelect, asistentes, ...checkboxes].forEach(el => {
        if (el) el.addEventListener("input", calcularTotal);
        if (el) el.addEventListener("change", calcularTotal);
    });

    calcularTotal();

    function mostrarMensaje(texto, tipo) {
        mensajeReserva.innerHTML = `<div class="alert alert-${tipo}">${texto}</div>`;
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        mensajeReserva.innerHTML = "";

        // Validaciones básicas
        if (!nombreCliente.value.trim() || !emailCliente.value.trim()) {
            mostrarMensaje("Por favor completa tu nombre y correo electrónico.", "danger");
            return;
        }
        if (!fechaEvento.value || !horaInicio.value) {
            mostrarMensaje("Por favor selecciona la fecha y hora del evento.", "danger");
            return;
        }
        if (!salonSelect.value || salonSelect.selectedIndex === 0) {
            mostrarMensaje("Por favor selecciona un salón.", "danger");
            return;
        }
        const numAsistentes = parseInt(asistentes.value, 10);
        if (!numAsistentes || numAsistentes <= 0) {
            mostrarMensaje("Ingresa una cantidad válida de asistentes.", "danger");
            return;
        }
        const salon = EventosProData.getSalonPorCodigo(salonSelect.value);
        if (numAsistentes > salon.capacidad) {
            mostrarMensaje(`La cantidad de asistentes supera la capacidad de ${salon.nombre} (${salon.capacidad} personas).`, "danger");
            return;
        }

        // Detección de doble reserva
        if (EventosProData.hayConflicto(salonSelect.value, fechaEvento.value)) {
            mostrarMensaje(`Ya existe una reserva para ${salon.nombre} en esa fecha. Por favor elige otra fecha u otro salón.`, "warning");
            return;
        }

        const serviciosSeleccionados = checkboxes
            .filter(cb => cb && cb.checked)
            .map(cb => cb.id.toUpperCase());

        const nuevoEvento = {
            id: EventosProData.generarId(),
            cliente: nombreCliente.value.trim(),
            email: emailCliente.value.trim(),
            salonCodigo: salonSelect.value,
            fecha: fechaEvento.value,
            hora: horaInicio.value,
            asistentes: numAsistentes,
            servicios: serviciosSeleccionados,
            total: calcularTotal(),
            estado: "Reservado"
        };

        EventosProData.agregarEvento(nuevoEvento);

        mostrarMensaje(`¡Reserva registrada con éxito! Tu número de evento es <strong>${nuevoEvento.id}</strong>.`, "success");
        form.reset();
        calcularTotal();
    });
});
