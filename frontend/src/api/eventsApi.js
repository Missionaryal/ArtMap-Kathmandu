// eventsApi.js
// Functions for fetching and managing events (workshops, exhibitions, classes, etc.)

import api from "./axiosConfig";

// GET /api/events/ — get all upcoming published events (no login required)
export const getUpcomingEvents = async () => {
  const response = await api.get("/events/");
  return response.data;
};

// GET /api/creator/events/ — get all events created by the logged-in creator
export const getCreatorEvents = async () => {
  const response = await api.get("/creator/events/");
  return response.data;
};

// POST /api/creator/events/create/ — create a new event (approved creators only)
export const createEvent = async (formData) => {
  const response = await api.post("/creator/events/create/", formData);
  return response.data;
};

// PATCH /api/creator/events/<id>/ — update an existing event (partial update)
export const updateEvent = async (eventId, formData) => {
  const response = await api.patch(`/creator/events/${eventId}/`, formData);
  return response.data;
};

// DELETE /api/creator/events/<id>/ — delete an event
export const deleteEvent = async (eventId) => {
  const response = await api.delete(`/creator/events/${eventId}/`);
  return response.data;
};
