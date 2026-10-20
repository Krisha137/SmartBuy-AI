import apiClient from './client';

export const generateRecommendations = (requirementId, limit = 5) => {
  return apiClient.post('/recommendations/', {
    requirement_id: requirementId,
    limit: limit,
  });
};

export const getRecommendationResult = (recommendationId) => {
  return apiClient.get(`/recommendations/${recommendationId}/`);
};
