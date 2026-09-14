/* ============================================================
   EventosPro - reportes.js
   Lógica para reportesAdmin.html:
   - Calcula estadísticas a partir de los eventos en localStorage.
   - Alerta automática si detecta doble reserva (conflicto).
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {

    const statEventos = document.getElementById("statEventos");
    const statIngresos = document.getElementById("statIngresos");
    const statOcupacion = document.getElementById("statOcupacion");
    const statConflictos = document.getElementById("statConflictos");
    const tablaRendimiento = document.getElementById("tablaRendimiento");

    if (!statEventos) return;

    const eventos = EventosProData.getEventos();
    const salones = EventosProData.SALONES;

    // Eventos totales registrados
    statEventos.textContent = eventos.length;

    // Ingresos totales
    const ingresosTotales = eventos.reduce((acc, ev) => acc + (ev.total || 0), 0);
    statIngresos.textContent = EventosProData.formatoCLP(ingresosTotales);

    // Ocupación: % de salones del catálogo que tienen al menos un evento activo
    const salonesUsados = new Set(eventos.map(ev => ev.salonCodigo));
    const ocupacion = salones.length ? Math.round((salonesUsados.size / salones.length) * 100) : 0;
    statOcupacion.textContent = ocupacion + "%";

    // Conflictos: eventos con mismo salón + misma fecha (doble reserva)
    let conflictos = 0;
    const vistos = {};
    eventos.forEach(ev => {
        const clave = ev.salonCodigo + "_" + ev.fecha;
        vistos[clave] = (vistos[clave] || 0) + 1;
    });
    Object.values(vistos).forEach(cant => {
        if (cant > 1) conflictos += cant - 1;
    });
    statConflictos.textContent = conflictos;

    // Rendimiento por salón
    if (tablaRendimiento) {
        tablaRendimiento.innerHTML = salones.map(salon => {
            const eventosDelSalon = eventos.filter(ev => ev.salonCodigo === salon.codigo);
            const ingresosDelSalon = eventosDelSalon.reduce((acc, ev) => acc + (ev.total || 0), 0);
            const porcentaje = eventos.length ? Math.round((eventosDelSalon.length / eventos.length) * 100) : 0;

            return `
                <tr>
                    <td>${salon.codigo}</td>
                    <td>${salon.nombre}</td>
                    <td>${eventosDelSalon.length}</td>
                    <td>${EventosProData.formatoCLP(ingresosDelSalon)}</td>
                    <td>${porcentaje}%</td>
                </tr>
            `;
        }).join("");
    }
});
