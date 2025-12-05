import React, { useEffect, useState } from 'react';
import { getAppointments, cancelAppointment } from '../services/api';

const AppointmentList = () => {
    const [appointments, setAppointments] = useState([]);

    useEffect(() => {
        const fetchAppointments = async () => {
            const data = await getAppointments();
            setAppointments(data);
        };

        fetchAppointments();
    }, []);

    const handleCancel = async (id) => {
        await cancelAppointment(id);
        setAppointments(appointments.filter(appointment => appointment.id !== id));
    };

    return (
        <div>
            <h2>Scheduled Appointments</h2>
            <ul>
                {appointments.map(appointment => (
                    <li key={appointment.id}>
                        <span>{`Doctor: ${appointment.doctorName}, Date: ${appointment.date}, Time: ${appointment.time}`}</span>
                        <button onClick={() => handleCancel(appointment.id)}>Cancel</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default AppointmentList;