from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


class Review(models.Model):
    # Dataset Primary Key: REV00001, REV00002...
    review_id = models.CharField(max_length=50, primary_key=True)
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='reviews'
    )
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('1.00')), MaxValueValidator(Decimal('5.00'))]
    )
    review_title = models.CharField(max_length=255, blank=True, default='')
    review_text = models.TextField()
    review_date = models.DateField(null=True, blank=True)
    verified_purchase = models.BooleanField(default=False)
    helpful_votes = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(rating__gte=1) & models.Q(rating__lte=5),
                name='review_rating_between_1_and_5'
            ),
        ]

    def clean(self):
        super().clean()
        if self.rating is not None and not (Decimal('1.00') <= self.rating <= Decimal('5.00')):
            raise ValidationError({'rating': 'Review rating must be between 1 and 5.'})

    def __str__(self):
        return f"Review {self.review_id} - Product {self.product_id} ({self.rating}/5)"


class ReviewAnalysis(models.Model):
    analysis_id = models.BigAutoField(primary_key=True)
    review = models.OneToOneField(
        Review,
        on_delete=models.CASCADE,
        related_name='analysis'
    )
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('neutral', 'Neutral'),
        ('negative', 'Negative'),
        ('empty', 'Empty'),
    ]
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='neutral')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'review_analyses'
        ordering = ['-created_at']

    def __str__(self):
        return f"Analysis for {self.review_id} ({self.sentiment})"


class ReviewThemeAnalysis(models.Model):
    id = models.BigAutoField(primary_key=True)
    review_analysis = models.ForeignKey(
        ReviewAnalysis,
        on_delete=models.CASCADE,
        related_name='theme_mentions'
    )
    theme = models.CharField(max_length=100)
    SENTIMENT_CHOICES = [
        ('positive', 'Positive'),
        ('negative', 'Negative'),
    ]
    sentiment = models.CharField(max_length=20, choices=SENTIMENT_CHOICES, default='positive')

    class Meta:
        db_table = 'review_theme_analyses'
        unique_together = ('review_analysis', 'theme', 'sentiment')

    def __str__(self):
        return f"{self.theme} ({self.sentiment}) in {self.review_analysis.review_id}"


class ProductReviewInsight(models.Model):
    product = models.OneToOneField(
        'products.Product',
        on_delete=models.CASCADE,
        primary_key=True,
        related_name='review_insight'
    )
    total_reviews = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'))
    verified_review_count = models.PositiveIntegerField(default=0)
    verified_review_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))

    positive_count = models.PositiveIntegerField(default=0)
    neutral_count = models.PositiveIntegerField(default=0)
    negative_count = models.PositiveIntegerField(default=0)

    positive_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    neutral_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))
    negative_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal('0.00'))

    CONFIDENCE_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ]
    confidence = models.CharField(max_length=20, choices=CONFIDENCE_CHOICES, default='low')
    summary = models.TextField(blank=True, default='')

    positive_themes = models.JSONField(default=list, blank=True)
    negative_themes = models.JSONField(default=list, blank=True)

    latest_review_date = models.DateField(null=True, blank=True)
    generated_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'product_review_insights'

    def __str__(self):
        return f"Review Insight for Product {self.product_id} ({self.total_reviews} reviews, {self.confidence} confidence)"
