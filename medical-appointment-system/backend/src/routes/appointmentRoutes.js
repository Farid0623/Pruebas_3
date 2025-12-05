const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');

// Route to create a new appointment
router.post('/', appointmentController.createAppointment);

// Route to get all appointments
router.get('/', appointmentController.getAllAppointments);

// Route to cancel an appointment
router.delete('/:id', appointmentController.cancelAppointment);

module.exports = router;