const Patient = require('../models/Patient');

// Register a new patient
exports.registerPatient = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        const newPatient = new Patient({ name, email, phone });
        await newPatient.save();
        res.status(201).json({ message: 'Patient registered successfully', patient: newPatient });
    } catch (error) {
        res.status(500).json({ message: 'Error registering patient', error: error.message });
    }
};

// Get all patients
exports.getPatients = async (req, res) => {
    try {
        const patients = await Patient.find();
        res.status(200).json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching patients', error: error.message });
    }
};

// Validate patient information
exports.validatePatient = (req, res, next) => {
    const { email, phone } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format' });
    }
    next();
};