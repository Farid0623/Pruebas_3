const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Base de datos en memoria
let patients = [];
let appointments = [];
let doctors = [
  { id: 1, name: 'Dr. García', specialty: 'Medicina General' },
  { id: 2, name: 'Dra. Martínez', specialty: 'Pediatría' },
  { id: 3, name: 'Dr. López', specialty: 'Cardiología' }
];

// Utilidades de validación
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^\d{10}$/;
  const cleanPhone = String(phone).replace(/[\s-]/g, '');
  return phoneRegex.test(cleanPhone) && phone.length >= 10 && phone.length <= 12;
};

const validateDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return date instanceof Date && !isNaN(date) && date > new Date();
};

const checkAppointmentOverlap = (doctorId, dateTime, excludeId = null) => {
  const newAppointmentTime = new Date(dateTime);
  
  return appointments.some(apt => {
    if (excludeId && apt.id === excludeId) return false;
    if (apt.doctorId !== doctorId) return false;
    if (apt.status === 'cancelled') return false;
    
    const existingTime = new Date(apt.dateTime);
    const timeDiff = Math.abs(existingTime - newAppointmentTime);
    const hourInMs = 60 * 60 * 1000;
    
    return timeDiff < hourInMs;
  });
};

// Rutas API

// Obtener doctores
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// Registrar paciente
app.post('/api/patients', (req, res) => {
  const { name, email, phone } = req.body;
  
  // Validaciones
  if (!name || !email || !phone) {
    return res.status(400).json({ 
      error: 'Todos los campos son requeridos',
      fields: { name: !name, email: !email, phone: !phone }
    });
  }
  
  if (name.trim().length < 3) {
    return res.status(400).json({ 
      error: 'El nombre debe tener al menos 3 caracteres' 
    });
  }
  
  if (!validateEmail(email)) {
    return res.status(400).json({ 
      error: 'Email inválido' 
    });
  }
  
  if (!validatePhone(phone)) {
    return res.status(400).json({ 
      error: 'Teléfono inválido. Debe tener 10 dígitos' 
    });
  }
  
  // Verificar email duplicado
  if (patients.some(p => p.email === email)) {
    return res.status(400).json({ 
      error: 'El email ya está registrado' 
    });
  }
  
  const patient = {
    id: patients.length + 1,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    phone: phone.replace(/[\s-]/g, ''),
    createdAt: new Date()
  };
  
  patients.push(patient);
  res.status(201).json(patient);
});

// Listar pacientes
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

// Crear cita
app.post('/api/appointments', (req, res) => {
  const { patientId, doctorId, dateTime, reason } = req.body;
  
  // Validaciones
  if (!patientId || !doctorId || !dateTime) {
    return res.status(400).json({ 
      error: 'Paciente, doctor y fecha/hora son requeridos' 
    });
  }
  
  const patient = patients.find(p => p.id === parseInt(patientId));
  if (!patient) {
    return res.status(404).json({ 
      error: 'Paciente no encontrado' 
    });
  }
  
  const doctor = doctors.find(d => d.id === parseInt(doctorId));
  if (!doctor) {
    return res.status(404).json({ 
      error: 'Doctor no encontrado' 
    });
  }
  
  if (!validateDateTime(dateTime)) {
    return res.status(400).json({ 
      error: 'Fecha/hora inválida o en el pasado' 
    });
  }
  
  // Verificar solapamiento de horarios
  if (checkAppointmentOverlap(parseInt(doctorId), dateTime)) {
    return res.status(409).json({ 
      error: 'El horario ya está ocupado para este doctor' 
    });
  }
  
  const appointment = {
    id: appointments.length + 1,
    patientId: parseInt(patientId),
    patientName: patient.name,
    doctorId: parseInt(doctorId),
    doctorName: doctor.name,
    dateTime: new Date(dateTime),
    reason: reason || 'Consulta general',
    status: 'scheduled',
    createdAt: new Date()
  };
  
  appointments.push(appointment);
  res.status(201).json(appointment);
});

// Listar citas
app.get('/api/appointments', (req, res) => {
  const { status, patientId, doctorId } = req.query;
  
  let filtered = appointments;
  
  if (status) {
    filtered = filtered.filter(apt => apt.status === status);
  }
  
  if (patientId) {
    filtered = filtered.filter(apt => apt.patientId === parseInt(patientId));
  }
  
  if (doctorId) {
    filtered = filtered.filter(apt => apt.doctorId === parseInt(doctorId));
  }
  
  res.json(filtered);
});

// Cancelar cita
app.delete('/api/appointments/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(apt => apt.id === id);
  
  if (!appointment) {
    return res.status(404).json({ 
      error: 'Cita no encontrada' 
    });
  }
  
  if (appointment.status === 'cancelled') {
    return res.status(400).json({ 
      error: 'La cita ya está cancelada' 
    });
  }
  
  appointment.status = 'cancelled';
  appointment.cancelledAt = new Date();
  
  res.json({ 
    message: 'Cita cancelada exitosamente',
    appointment 
  });
});

// Reset endpoint (solo para pruebas)
app.post('/api/reset', (req, res) => {
  patients = [];
  appointments = [];
  res.json({ message: 'Datos reiniciados' });
});

// Servir frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar servidor
const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

module.exports = { app, server };
