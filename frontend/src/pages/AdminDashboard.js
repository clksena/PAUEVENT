import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { eventAPI, registrationAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [showParticipants, setShowParticipants] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    maxParticipants: 100,
  });

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await eventAPI.getAll();
      setEvents(response.data);
    } catch (err) {
      setError('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        location: event.location,
        date: new Date(event.date).toISOString().slice(0, 16),
        maxParticipants: event.maxParticipants,
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        location: '',
        date: '',
        maxParticipants: 100,
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      location: '',
      date: '',
      maxParticipants: 100,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      if (editingEvent) {
        await eventAPI.update(editingEvent.id, formData);
      } else {
        await eventAPI.create(formData);
      }
      handleCloseModal();
      await loadEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await eventAPI.delete(id);
        await loadEvents();
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete event');
      }
    }
  };

  const handleViewParticipants = async (event) => {
    try {
      const response = await registrationAPI.getEventParticipants(event.id);
      setParticipants(response.data);
      setSelectedEvent(event);
      setShowParticipants(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load participants');
    }
  };

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
          <h1>PAUEvent - Admin Dashboard</h1>
          <div className="header-actions">
            <span>Welcome, {user?.firstName} {user?.lastName}</span>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              User View
            </button>
            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {error && <div className="error">{error}</div>}

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Events Management</h2>
            <button className="btn btn-primary" onClick={() => handleOpenModal()}>
              Create Event
            </button>
          </div>

          {events.length === 0 ? (
            <p>No events created yet</p>
          ) : (
            <div className="event-grid">
              {events.map((event) => {
                const currentParticipants = event.registrations?.length || 0;
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
                      <button
                        className="btn btn-primary"
                        onClick={() => handleViewParticipants(event)}
                      >
                        View Participants
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleOpenModal(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger"
                        onClick={() => handleDelete(event.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEvent ? 'Edit Event' : 'Create Event'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Max Participants</label>
                <input
                  type="number"
                  min="1"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary">
                {editingEvent ? 'Update' : 'Create'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showParticipants && (
        <div className="modal" onClick={() => setShowParticipants(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Participants - {selectedEvent?.title}</h2>
              <button className="close-btn" onClick={() => setShowParticipants(false)}>
                ×
              </button>
            </div>
            {participants.length === 0 ? (
              <p>No participants registered yet</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered At</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((reg) => (
                    <tr key={reg.id}>
                      <td>{reg.user.firstName} {reg.user.lastName}</td>
                      <td>{reg.user.email}</td>
                      <td>{formatDate(reg.registeredAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

