/* ============================================================
   EventosPro - gestion.js
   Lógica para gestionEventos.html:
   - Renderiza la tabla de eventos desde localStorage.
   - Buscador en vivo por cliente / salón / ID.
   - Botón "Editar Estado" avanza el evento al siguiente estado.
   - Botón "Ver Detalle" muestra la información completa.
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const tbody = document.querySelector("table tbody");
    const buscador = document.querySelector('input[placeholder="Buscar evento..."]');

    if (!tbody) return;

    function formatearFecha(fechaISO) {
        if (!fechaISO) return "-";
        const [anio, mes, dia] = fechaISO.split("-");
        return `${dia}/${mes}/${anio}`;
    }

    function renderTabla(filtro = "") {
        const eventos = EventosProData.getEventos();
        const texto = filtro.trim().toLowerCase();

        const filtrados = eventos.filter(ev => {
            const salon = EventosProData.getSalonPorCodigo(ev.salonCodigo);
            const salonNombre = salon ? salon.nombre : ev.salonCodigo;
            return (
                ev.id.toLowerCase().includes(texto) ||
                ev.cliente.toLowerCase().includes(texto) ||
                salonNombre.toLowerCase().includes(texto)
            );
        });

        if (filtrados.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted py-4">No se encontraron eventos.</td></tr>`;
            return;
        }

        tbody.innerHTML = filtrados.map(ev => {
            const salon = EventosProData.getSalonPorCodigo(ev.salonCodigo);
            const salonNombre = salon ? `${ev.salonCodigo} - ${salon.nombre}` : ev.salonCodigo;
            const badgeClase = EventosProData.badgeClasePorEstado(ev.estado);
            const esFinal = ev.estado === "Finalizado";

            return `
                <tr>
                    <td>#${ev.id}</td>
                    <td>${ev.cliente}</td>
                    <td>${salonNombre}</td>
                    <td>${formatearFecha(ev.fecha)}</td>
                    <td><span class="badge ${badgeClase}">${ev.estado}</span></td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" data-accion="detalle" data-id="${ev.id}">Ver Detalle</button>
                        <button class="btn btn-sm btn-outline-secondary" data-accion="avanzar" data-id="${ev.id}" ${esFinal ? "disabled" : ""}>Editar Estado</button>
                    </td>
                </tr>
            `;
        }).join("");
    }

    function verDetalle(id) {
        const eventos = EventosProData.getEventos();
        const ev = eventos.find(e => e.id === id);
        if (!ev) return;
        const salon = EventosProData.getSalonPorCodigo(ev.salonCodigo);
        const servicios = ev.servicios && ev.servicios.length
            ? ev.servicios.map(cod => EventosProData.getServicioPorCodigo(cod)?.nombre || cod).join(", ")
            : "Ninguno";

        alert(
            `Detalle del evento ${ev.id}\n\n` +
            `Cliente: ${ev.cliente}\n` +
            `Correo: ${ev.email || "-"}\n` +
            `Salón: ${salon ? salon.nombre : ev.salonCodigo}\n` +
            `Fecha: ${formatearFecha(ev.fecha)} - ${ev.hora || "-"}\n` +
            `Asistentes: ${ev.asistentes || "-"}\n` +
            `Servicios adicionales: ${servicios}\n` +
            `Total estimado: ${EventosProData.formatoCLP(ev.total)}\n` +
            `Estado actual: ${ev.estado}`
        );
    }

    function avanzarEstado(id) {
        const eventos = EventosProData.getEventos();
        const ev = eventos.find(e => e.id === id);
        if (!ev) return;
        const nuevoEstado = EventosProData.siguienteEstado(ev.estado);
        EventosProData.actualizarEstado(id, nuevoEstado);
        renderTabla(buscador ? buscador.value : "");
    }

    tbody.addEventListener("click", (e) => {
        const btn = e.target.closest("button[data-accion]");
        if (!btn) return;
        const id = btn.dataset.id;
        if (btn.dataset.accion === "detalle") verDetalle(id);
        if (btn.dataset.accion === "avanzar") avanzarEstado(id);
    });

    if (buscador) {
        buscador.addEventListener("input", (e) => renderTabla(e.target.value));
    }

    renderTabla();
});
