import axios from 'axios';

const API_URL = 'http://localhost:5000/api'; // Adjust the URL based on your backend configuration

export const registerPatient = async (patientData) => {
    try {
        const response = await axios.post(`${API_URL}/patients`, patientData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const bookAppointment = async (appointmentData) => {
    try {
        const response = await axios.post(`${API_URL}/appointments`, appointmentData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getAppointments = async () => {
    try {
        const response = await axios.get(`${API_URL}/appointments`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const getDoctors = async () => {
    try {
        const response = await axios.get(`${API_URL}/doctors`);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};