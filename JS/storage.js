/* ============================================================
   EventosPro - storage.js
   Capa de datos básica usando localStorage.
   Este archivo debe cargarse ANTES que cualquier otro script
   de página (reserva.js, gestion.js, proveedores.js, reportes.js).
   ============================================================ */

const EventosProData = (() => {

    const KEY_EVENTOS = "eventospro_eventos";
    const KEY_USUARIOS = "eventospro_usuarios";
    const KEY_PROVEEDORES = "eventospro_proveedores";

    // Catálogo de salones (según ficha de EventosPro)
    const SALONES = [
        { codigo: "SL001", nombre: "Salón Principal", capacidad: 500, precio: 1200000 },
        { codigo: "SL002", nombre: "Salón Ejecutivo", capacidad: 50, precio: 350000 },
        { codigo: "SL003", nombre: "Salón de Seminarios", capacidad: 120, precio: 500000 },
        { codigo: "SL004", nombre: "Salón de Bodas", capacidad: 200, precio: 750000 },
        { codigo: "SL005", nombre: "Salón de Exposiciones", capacidad: 300, precio: 850000 }
    ];

    // Servicios adicionales
    const SERVICIOS = [
        { codigo: "SE001", nombre: "Catering", tipo: "porPersona", precio: 15000 },
        { codigo: "SE002", nombre: "Equipo Audiovisual Extra", tipo: "fijo", precio: 100000 },
        { codigo: "SE003", nombre: "Personal de Apoyo", tipo: "fijo", precio: 50000 },
        { codigo: "SE004", nombre: "Decoración", tipo: "fijo", precio: 200000 }
    ];

    // Flujo de estados de un evento (en orden)
    const ESTADOS = ["Consultado", "Reservado", "En planificación", "En ejecución", "Finalizado"];

    // Datos iniciales de ejemplo (se cargan solo la primera vez)
    const EVENTOS_INICIALES = [
        { id: "EV-101", cliente: "TechCorp Chile", email: "contacto@techcorp.cl", salonCodigo: "SL001", fecha: "2026-10-15", hora: "19:00", asistentes: 250, servicios: ["SE001"], total: 1200000 + (15000 * 250), estado: "En planificación" },
        { id: "EV-102", cliente: "María González", email: "maria.gonzalez@mail.cl", salonCodigo: "SL004", fecha: "2026-10-20", hora: "20:00", asistentes: 150, servicios: ["SE004"], total: 750000 + 200000, estado: "Reservado" },
        { id: "EV-103", cliente: "Banco Global", email: "eventos@bancoglobal.cl", salonCodigo: "SL002", fecha: "2026-09-11", hora: "09:00", asistentes: 40, servicios: ["SE002"], total: 350000 + 100000, estado: "En ejecución" },
        { id: "EV-104", cliente: "Fundación Educar", email: "contacto@fundacioneducar.cl", salonCodigo: "SL003", fecha: "2026-09-01", hora: "10:00", asistentes: 100, servicios: [], total: 500000, estado: "Finalizado" }
    ];

    function _leer(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.error("Error leyendo localStorage:", key, e);
            return fallback;
        }
    }

    function _guardar(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error("Error guardando en localStorage:", key, e);
            return false;
        }
    }

    function inicializar() {
        if (localStorage.getItem(KEY_EVENTOS) === null) {
            _guardar(KEY_EVENTOS, EVENTOS_INICIALES);
        }
        if (localStorage.getItem(KEY_USUARIOS) === null) {
            _guardar(KEY_USUARIOS, []);
        }
        if (localStorage.getItem(KEY_PROVEEDORES) === null) {
            _guardar(KEY_PROVEEDORES, {});
        }
    }

    function getEventos() {
        return _leer(KEY_EVENTOS, []);
    }

    function guardarEventos(eventos) {
        return _guardar(KEY_EVENTOS, eventos);
    }

    function agregarEvento(evento) {
        const eventos = getEventos();
        eventos.push(evento);
        guardarEventos(eventos);
        return evento;
    }

    function actualizarEstado(id, nuevoEstado) {
        const eventos = getEventos();
        const evento = eventos.find(e => e.id === id);
        if (evento) {
            evento.estado = nuevoEstado;
            guardarEventos(eventos);
        }
        return evento;
    }

    function siguienteEstado(estadoActual) {
        const idx = ESTADOS.indexOf(estadoActual);
        if (idx === -1 || idx === ESTADOS.length - 1) return estadoActual;
        return ESTADOS[idx + 1];
    }

    function generarId() {
        const eventos = getEventos();
        const numeros = eventos
            .map(e => parseInt(String(e.id).replace("EV-", ""), 10))
            .filter(n => !isNaN(n));
        const siguiente = (numeros.length ? Math.max(...numeros) : 100) + 1;
        return "EV-" + siguiente;
    }

    // Revisa si ya existe una reserva para el mismo salón en la misma fecha
    function hayConflicto(salonCodigo, fecha, idExcluir) {
        const eventos = getEventos();
        return eventos.some(e =>
            e.salonCodigo === salonCodigo &&
            e.fecha === fecha &&
            e.estado !== "Finalizado" &&
            e.id !== idExcluir
        );
    }

    function getSalonPorCodigo(codigo) {
        return SALONES.find(s => s.codigo === codigo);
    }

    function getServicioPorCodigo(codigo) {
        return SERVICIOS.find(s => s.codigo === codigo);
    }

    function badgeClasePorEstado(estado) {
        const mapa = {
            "Consultado": "bg-primary",
            "Reservado": "bg-info text-dark",
            "En planificación": "bg-warning text-dark",
            "En ejecución": "bg-success",
            "Finalizado": "bg-secondary"
        };
        return mapa[estado] || "bg-secondary";
    }

    function formatoCLP(numero) {
        return "$" + Number(numero || 0).toLocaleString("es-CL");
    }

    // Usuarios (registro / login simulado)
    function getUsuarios() {
        return _leer(KEY_USUARIOS, []);
    }

    function agregarUsuario(usuario) {
        const usuarios = getUsuarios();
        usuarios.push(usuario);
        _guardar(KEY_USUARIOS, usuarios);
        return usuario;
    }

    // Estado de confirmación de proveedores (portal proveedores)
    function getEstadoProveedor(servicioId) {
        const estados = _leer(KEY_PROVEEDORES, {});
        return estados[servicioId] || null;
    }

    function setEstadoProveedor(servicioId, estado) {
        const estados = _leer(KEY_PROVEEDORES, {});
        estados[servicioId] = estado;
        _guardar(KEY_PROVEEDORES, estados);
    }

    inicializar();

    return {
        SALONES,
        SERVICIOS,
        ESTADOS,
        getEventos,
        guardarEventos,
        agregarEvento,
        actualizarEstado,
        siguienteEstado,
        generarId,
        hayConflicto,
        getSalonPorCodigo,
        getServicioPorCodigo,
        badgeClasePorEstado,
        formatoCLP,
        getUsuarios,
        agregarUsuario,
        getEstadoProveedor,
        setEstadoProveedor
    };
})();
