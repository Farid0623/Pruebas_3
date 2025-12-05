const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');

// Route to get all doctors
router.get('/', doctorController.getAllDoctors);

// Route to get a doctor by ID
router.get('/:id', doctorController.getDoctorById);

// Route to create a new doctor
router.post('/', doctorController.createDoctor);

// Route to update a doctor's information
router.put('/:id', doctorController.updateDoctor);

// Route to delete a doctor
router.delete('/:id', doctorController.deleteDoctor);

module.exports = router;