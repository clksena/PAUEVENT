import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventAPI, registrationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventsRes, registrationsRes] = await Promise.all([
        eventAPI.getAll(),
        registrationAPI.getMyRegistrations(),
      ]);
      setEvents(eventsRes.data);
      setMyRegistrations(registrationsRes.data.map(r => r.eventId));
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      await registrationAPI.register(eventId);
      setMyRegistrations([...myRegistrations, eventId]);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  const handleCancel = async (eventId) => {
    try {
      await registrationAPI.cancel(eventId);
      setMyRegistrations(myRegistrations.filter(id => id !== eventId));
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel registration');
    }
  };

  const isRegistered = (eventId) => myRegistrations.includes(eventId);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="App">
      <div className="header">
        <div className="header-content">
          <h1>PAUEvent</h1>
          <div className="header-actions">
            <span>Welcome, {user?.firstName} {user?.lastName}</span>
            {user?.roles?.some(role => role.name === 'ADMIN') && (
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </button>
            )}
            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}
        
        <div className="card">
          <h2>Available Events</h2>
          {events.length === 0 ? (
            <p>No events available</p>
          ) : (
            <div className="event-grid">
              {events.map((event) => {
                const registered = isRegistered(event.id);
                const currentParticipants = event.registrations?.length || 0;
                const isFull = currentParticipants >= event.maxParticipants;

                return (
                  <div key={event.id} className="event-card">
                    <h3>{event.title}</h3>
                    <p>{event.description}</p>
                    <p className="event-location">📍 {event.location}</p>
                    <p className="event-date">📅 {formatDate(event.date)}</p>
                    <p>
                      👥 {currentParticipants} / {event.maxParticipants} participants
                    </p>
                    <div className="event-actions">
                      {registered ? (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleCancel(event.id)}
                        >
                          Cancel Registration
                        </button>
                      ) : (
                        <button
                          className="btn btn-success"
                          onClick={() => handleRegister(event.id)}
                          disabled={isFull}
                        >
                          {isFull ? 'Event Full' : 'Register'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

