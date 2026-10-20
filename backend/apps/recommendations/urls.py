from django.urls import path
from apps.recommendations.views import RecommendationCreateView, RecommendationDetailView

urlpatterns = [
    path('recommendations/', RecommendationCreateView.as_view(), name='recommendation-create'),
    path('recommendations/<int:recommendation_id>/', RecommendationDetailView.as_view(), name='recommendation-detail'),
]
