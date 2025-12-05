// API Base URL
const API_URL = 'http://localhost:3000/api';

// Estado global
let pacientes = [];
let doctores = [];
let citas = [];

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    inicializarTabs();
    cargarDoctores();
    cargarPacientes();
    cargarCitas();
    configurarFormularios();
    setMinDate();
});

// Configuración de tabs
function inicializarTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`tab-${tabName}`).classList.add('active');
            
            if (tabName === 'citas') {
                cargarCitas();
            }
        });
    });
}

// Establecer fecha mínima
function setMinDate() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split('T')[0];
    document.getElementById('fecha').min = minDate;
}

// Configurar formularios
function configurarFormularios() {
    // Formulario de registro de paciente
    document.getElementById('form-paciente').addEventListener('submit', async (e) => {
        e.preventDefault();
        await registrarPaciente();
    });
    
    // Formulario de agendar cita
    document.getElementById('form-cita').addEventListener('submit', async (e) => {
        e.preventDefault();
        await agendarCita();
    });
    
    // Filtro de citas
    document.getElementById('filtro-paciente').addEventListener('change', () => {
        cargarCitas();
    });
}

// Cargar doctores
async function cargarDoctores() {
    try {
        const response = await fetch(`${API_URL}/doctors`);
        doctores = await response.json();
        
        const select = document.getElementById('doctor-select');
        select.innerHTML = '<option value="">-- Seleccione un doctor --</option>';
        
        doctores.forEach(doctor => {
            const option = document.createElement('option');
            option.value = doctor.id;
            option.textContent = `${doctor.name} - ${doctor.specialty}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar doctores:', error);
    }
}

// Cargar pacientes
async function cargarPacientes() {
    try {
        const response = await fetch(`${API_URL}/patients`);
        pacientes = await response.json();
        
        const selectCita = document.getElementById('paciente-select');
        const selectFiltro = document.getElementById('filtro-paciente');
        
        selectCita.innerHTML = '<option value="">-- Seleccione un paciente --</option>';
        selectFiltro.innerHTML = '<option value="">Todos los pacientes</option>';
        
        pacientes.forEach(paciente => {
            const option1 = document.createElement('option');
            option1.value = paciente.id;
            option1.textContent = `${paciente.name} - ${paciente.email}`;
            selectCita.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = paciente.id;
            option2.textContent = paciente.name;
            selectFiltro.appendChild(option2);
        });
    } catch (error) {
        console.error('Error al cargar pacientes:', error);
    }
}

// Registrar paciente
async function registrarPaciente() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    
    try {
        const response = await fetch(`${API_URL}/patients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: nombre, email, phone: telefono })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarMensaje('mensaje-registro', 'Paciente registrado exitosamente', 'success');
            document.getElementById('form-paciente').reset();
            await cargarPacientes();
        } else {
            mostrarMensaje('mensaje-registro', data.error, 'error');
        }
    } catch (error) {
        mostrarMensaje('mensaje-registro', 'Error al registrar paciente', 'error');
        console.error('Error:', error);
    }
}

// Agendar cita
async function agendarCita() {
    const pacienteId = document.getElementById('paciente-select').value;
    const doctorId = document.getElementById('doctor-select').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;
    const motivo = document.getElementById('motivo').value.trim();
    
    const dateTime = `${fecha}T${hora}:00`;
    
    try {
        const response = await fetch(`${API_URL}/appointments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientId: parseInt(pacienteId),
                doctorId: parseInt(doctorId),
                dateTime,
                reason: motivo
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarMensaje('mensaje-cita', 'Cita agendada exitosamente', 'success');
            document.getElementById('form-cita').reset();
            await cargarCitas();
        } else {
            mostrarMensaje('mensaje-cita', data.error, 'error');
        }
    } catch (error) {
        mostrarMensaje('mensaje-cita', 'Error al agendar cita', 'error');
        console.error('Error:', error);
    }
}

// Cargar citas
async function cargarCitas() {
    try {
        const filtro = document.getElementById('filtro-paciente').value;
        let url = `${API_URL}/appointments`;
        
        if (filtro) {
            url += `?patientId=${filtro}`;
        }
        
        const response = await fetch(url);
        citas = await response.json();
        
        mostrarCitas(citas);
    } catch (error) {
        console.error('Error al cargar citas:', error);
    }
}

// Mostrar citas
function mostrarCitas(citas) {
    const container = document.getElementById('lista-citas');
    
    if (citas.length === 0) {
        container.innerHTML = '<p class="text-center">No hay citas agendadas</p>';
        return;
    }
    
    container.innerHTML = citas.map(cita => {
        const fecha = new Date(cita.dateTime);
        const fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const horaFormateada = fecha.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusClass = cita.status === 'cancelled' ? 'status-cancelled' : 'status-scheduled';
        const statusText = cita.status === 'cancelled' ? 'Cancelada' : 'Agendada';
        const cardClass = cita.status === 'cancelled' ? 'appointment-card cancelled' : 'appointment-card';
        
        return `
            <div class="${cardClass}" data-testid="appointment-card-${cita.id}">
                <div class="appointment-header">
                    <div class="appointment-info">
                        <h3>👨‍⚕️ ${cita.doctorName}</h3>
                        <p><strong>Paciente:</strong> ${cita.patientName}</p>
                        <p><strong>Fecha:</strong> ${fechaFormateada}</p>
                        <p><strong>Hora:</strong> ${horaFormateada}</p>
                        <p><strong>Motivo:</strong> ${cita.reason}</p>
                    </div>
                    <div>
                        <span class="appointment-status ${statusClass}">${statusText}</span>
                    </div>
                </div>
                ${cita.status !== 'cancelled' ? `
                    <button 
                        class="btn btn-danger" 
                        onclick="cancelarCita(${cita.id})"
                        data-testid="cancel-appointment-${cita.id}"
                    >
                        ❌ Cancelar Cita
                    </button>
                ` : ''}
            </div>
        `;
    }).join('');
}

// Cancelar cita
async function cancelarCita(id) {
    if (!confirm('¿Está seguro de cancelar esta cita?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/appointments/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await cargarCitas();
        } else {
            const data = await response.json();
            alert(data.error);
        }
    } catch (error) {
        console.error('Error al cancelar cita:', error);
        alert('Error al cancelar cita');
    }
}

// Mostrar mensajes
function mostrarMensaje(elementId, mensaje, tipo) {
    const element = document.getElementById(elementId);
    element.textContent = mensaje;
    element.className = `message ${tipo}`;
    element.style.display = 'block';
    
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}
