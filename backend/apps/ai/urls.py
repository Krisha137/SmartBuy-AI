from django.urls import path
from .views import UnderstandRequirementsView, SmartSearchRecommendationView

urlpatterns = [
    path('ai/understand-requirements/', UnderstandRequirementsView.as_view(), name='ai-understand-requirements'),
    path('smartbuy/search/', SmartSearchRecommendationView.as_view(), name='smartbuy-search'),
]
