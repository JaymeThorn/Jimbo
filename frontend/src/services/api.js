import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const register = (email, password) => 
  api.post('/auth/register', { email, password });

export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const getWorkouts = () => 
  api.get('/workouts');

export const getWorkout = (id) => 
  api.get(`/workouts/${id}`);

export const createWorkout = (workout) => 
  api.post('/workouts', workout);

export const deleteWorkout = (id) => 
  api.delete(`/workouts/${id}`);

export const getTemplates = () => 
  api.get('/templates');

export const createTemplate = (template) => 
  api.post('/templates', template);

export const deleteTemplate = (id) => 
  api.delete(`/templates/${id}`);

export const getStats = () => 
  api.get('/stats');

export const getRuns = () => 
  api.get('/runs');

export const getRun = (id) => 
  api.get(`/runs/${id}`);

export const createRun = (run) => 
  api.post('/runs', run);

export const deleteRun = (id) => 
  api.delete(`/runs/${id}`);

export const getRunStats = () => 
  api.get('/runs/stats');

export const getHeatmapData = () =>
  api.get('/runs/heatmap');

export const getFriendsRuns = () =>
  api.get('/runs/friends');

export const shareRun = (id) =>
  api.post(`/runs/${id}/share`);

export const getSegmentLeaderboard = (routeName) =>
  api.get(`/runs/segment/${routeName}`);

export const getActivityFeed = () =>
  api.get('/runs/feed');

export const addKudos = (runId) =>
  api.post(`/runs/${runId}/kudos`);

export const addComment = (runId, text) =>
  api.post(`/runs/${runId}/comment`, { text });

export const getUserAchievements = () =>
  api.get('/runs/achievements');

export const followUser = (targetUserId) =>
  api.post('/runs/follow', { targetUserId });

export const searchUsers = (query) =>
  api.get(`/runs/search-users?query=${query}`);
