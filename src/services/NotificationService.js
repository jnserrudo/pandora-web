// src/services/NotificationService.js
import axios from 'axios';
import { API_URL } from './config';

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getNotifications = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/notifications`, getHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markNotificationAsRead = async (id, token) => {
  const response = await axios.patch(`${API_URL}/notifications/${id}/read`, {}, getHeaders(token));
  return response.data;
};

export const markAllNotificationsAsRead = async (token) => {
  const response = await axios.patch(`${API_URL}/notifications/read-all`, {}, getHeaders(token));
  return response.data;
};
