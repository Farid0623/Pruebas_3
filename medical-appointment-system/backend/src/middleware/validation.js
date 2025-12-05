const { body, validationResult } = require('express-validator');

const validateAppointment = [
    body('date').isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('time').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Time must be in HH:mm format'),
    body('patientId').isMongoId().withMessage('Patient ID must be a valid MongoDB ObjectId'),
    body('doctorId').isMongoId().withMessage('Doctor ID must be a valid MongoDB ObjectId'),
];

const validatePatient = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Email must be a valid email address'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone number must be 10 digits'),
];

const validateDoctor = [
    body('name').notEmpty().withMessage('Name is required'),
    body('specialty').notEmpty().withMessage('Specialty is required'),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateAppointment,
    validatePatient,
    validateDoctor,
    validate,
};