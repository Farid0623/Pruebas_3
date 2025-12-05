const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');

// Route to register a new patient
router.post('/register', patientController.registerPatient);

// Route to get patient details
router.get('/:id', patientController.getPatientDetails);

// Route to update patient information
router.put('/:id', patientController.updatePatient);

// Route to delete a patient
router.delete('/:id', patientController.deletePatient);

module.exports = router;