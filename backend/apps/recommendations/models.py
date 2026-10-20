from django.db import models


class RecommendationResult(models.Model):
    recommendation_id = models.BigAutoField(primary_key=True)
    requirement = models.ForeignKey(
        'requirements.Requirement',
        on_delete=models.CASCADE,
        related_name='recommendation_results'
    )
    total_candidates = models.PositiveIntegerField(default=0)
    recommendations_payload = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'recommendation_results'
        ordering = ['-created_at']

    def __str__(self):
        return f"Recommendation #{self.recommendation_id} for REQ #{self.requirement_id}"
