# Medical Appointment Booking System

This project is a simple medical appointment booking system that allows patients to book appointments with doctors. It consists of a backend API built with Node.js and Express, and a frontend application built with React.

## Project Structure

```
medical-appointment-system
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── config
│   │   │   └── database.js
│   │   ├── controllers
│   │   │   ├── appointmentController.js
│   │   │   ├── patientController.js
│   │   │   └── doctorController.js
│   │   ├── models
│   │   │   ├── Appointment.js
│   │   │   ├── Patient.js
│   │   │   └── Doctor.js
│   │   ├── routes
│   │   │   ├── appointmentRoutes.js
│   │   │   ├── patientRoutes.js
│   │   │   └── doctorRoutes.js
│   │   └── middleware
│   │       └── validation.js
│   ├── package.json
│   └── .env.example
├── frontend
│   ├── public
│   │   └── index.html
│   ├── src
│   │   ├── index.js
│   │   ├── App.js
│   │   ├── components
│   │   │   ├── AppointmentForm.js
│   │   │   ├── AppointmentList.js
│   │   │   └── DoctorList.js
│   │   ├── services
│   │   │   └── api.js
│   │   └── styles
│   │       └── App.css
│   ├── package.json
│   └── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node package manager)
- MongoDB (or any other database of your choice)

### Backend Setup

1. Navigate to the `backend` directory:
   ```
   cd backend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the `.env.example` file and configure your database connection.

4. Start the backend server:
   ```
   npm start
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```
   cd frontend
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Start the frontend application:
   ```
   npm start
   ```

### Usage

- Access the frontend application in your browser at `http://localhost:3000`.
- Use the application to book, view, and manage appointments.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License.