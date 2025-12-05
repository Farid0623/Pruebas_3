import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppointmentForm from './components/AppointmentForm';
import AppointmentList from './components/AppointmentList';
import DoctorList from './components/DoctorList';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <h1>Medical Appointment Booking System</h1>
        <Switch>
          <Route path="/" exact component={DoctorList} />
          <Route path="/appointments" component={AppointmentList} />
          <Route path="/book-appointment" component={AppointmentForm} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;