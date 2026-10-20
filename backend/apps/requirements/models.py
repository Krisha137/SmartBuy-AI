from decimal import Decimal
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
from django.core.exceptions import ValidationError


class Requirement(models.Model):
    requirement_id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='requirements'
    )
    category = models.CharField(max_length=100, default='Laptop')
    budget_min = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    budget_max = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    use_case = models.CharField(max_length=100, blank=True, default='')
    minimum_ram = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)]
    )
    minimum_storage = models.PositiveIntegerField(
        null=True,
        blank=True,
        validators=[MinValueValidator(1)]
    )
    preferred_storage_type = models.CharField(max_length=50, blank=True, default='')
    battery_priority = models.CharField(max_length=50, blank=True, default='')
    performance_priority = models.CharField(max_length=50, blank=True, default='')
    weight_priority = models.CharField(max_length=50, blank=True, default='')
    brand_preference = models.CharField(max_length=100, blank=True, default='')
    raw_user_query = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'requirements'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(budget_min__gte=0),
                name='requirement_budget_min_non_negative'
            ),
            models.CheckConstraint(
                check=models.Q(budget_max__gte=0),
                name='requirement_budget_max_non_negative'
            ),
        ]

    def clean(self):
        super().clean()
        if self.budget_min is not None and self.budget_min < Decimal('0.00'):
            raise ValidationError({'budget_min': 'Minimum budget cannot be negative.'})
        if self.budget_max is not None and self.budget_max < Decimal('0.00'):
            raise ValidationError({'budget_max': 'Maximum budget cannot be negative.'})
        if (self.budget_min is not None and self.budget_max is not None and 
                self.budget_max > Decimal('0.00') and self.budget_max < self.budget_min):
            raise ValidationError({'budget_max': 'Maximum budget cannot be less than minimum budget.'})

    def __str__(self):
        return f"Requirement #{self.requirement_id} ({self.category})"
