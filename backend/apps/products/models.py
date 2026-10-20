from decimal import Decimal
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.core.exceptions import ValidationError


class Product(models.Model):
    # Dataset Primary Key: LAP0001, LAP0002...
    product_id = models.CharField(max_length=50, primary_key=True)
    product_name = models.CharField(max_length=255, db_index=True)
    brand = models.CharField(max_length=100, db_index=True)
    category = models.CharField(max_length=100, default='Laptop', db_index=True)
    product_segment = models.CharField(max_length=100, blank=True, default='', db_index=True)
    
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    currency = models.CharField(max_length=3, default='INR')
    original_price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    
    # Processor details
    processor = models.CharField(max_length=150, blank=True, default='')
    processor_brand = models.CharField(max_length=50, blank=True, default='')
    processor_model = models.CharField(max_length=100, blank=True, default='')
    cpu_cores = models.PositiveIntegerField(null=True, blank=True)
    
    # Specs
    ram_gb = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    storage_type = models.CharField(max_length=50)
    storage_gb = models.PositiveIntegerField(
        validators=[MinValueValidator(1)]
    )
    gpu = models.CharField(max_length=100)
    gpu_type = models.CharField(max_length=50, blank=True, default='')
    
    display_size = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    display_resolution = models.CharField(max_length=50)
    display_type = models.CharField(max_length=50, blank=True, default='')
    refresh_rate = models.PositiveIntegerField(default=60)
    
    weight_kg = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.01'))]
    )
    battery_wh = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.0'))]
    )
    battery_life = models.DecimalField(
        max_digits=4,
        decimal_places=1,
        null=True,
        blank=True,
        validators=[MinValueValidator(Decimal('0.0'))]
    )
    operating_system = models.CharField(max_length=100)
    release_year = models.PositiveIntegerField(null=True, blank=True)
    
    # Ratings and reviews
    rating = models.DecimalField(
        max_digits=3,
        decimal_places=2,
        default=Decimal('0.00'),
        validators=[MinValueValidator(Decimal('0.00')), MaxValueValidator(Decimal('5.00'))]
    )
    review_count = models.PositiveIntegerField(default=0)
    
    # Optional / Future fields
    warranty = models.CharField(max_length=100, blank=True, default='')
    product_description = models.TextField(blank=True, default='')
    image_url = models.URLField(max_length=500, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'products'
        ordering = ['-created_at']
        constraints = [
            models.CheckConstraint(
                check=models.Q(price__gte=0),
                name='product_price_non_negative'
            ),
            models.CheckConstraint(
                check=models.Q(original_price__isnull=True) | models.Q(original_price__gte=0),
                name='product_original_price_non_negative'
            ),
            models.CheckConstraint(
                check=models.Q(ram_gb__gt=0),
                name='product_ram_gb_positive'
            ),
            models.CheckConstraint(
                check=models.Q(storage_gb__gt=0),
                name='product_storage_gb_positive'
            ),
            models.CheckConstraint(
                check=models.Q(weight_kg__gt=0),
                name='product_weight_kg_positive'
            ),
            models.CheckConstraint(
                check=models.Q(rating__gte=0) & models.Q(rating__lte=5),
                name='product_rating_between_0_and_5'
            ),
        ]

    def clean(self):
        super().clean()
        if self.price is not None and self.price < Decimal('0.00'):
            raise ValidationError({'price': 'Price cannot be negative.'})
        if self.original_price is not None and self.original_price < Decimal('0.00'):
            raise ValidationError({'original_price': 'Original price cannot be negative.'})
        if self.ram_gb is not None and self.ram_gb <= 0:
            raise ValidationError({'ram_gb': 'RAM (GB) must be greater than zero.'})
        if self.storage_gb is not None and self.storage_gb <= 0:
            raise ValidationError({'storage_gb': 'Storage (GB) must be greater than zero.'})
        if self.weight_kg is not None and self.weight_kg <= Decimal('0.00'):
            raise ValidationError({'weight_kg': 'Weight (kg) must be greater than zero.'})
        if self.rating is not None and not (Decimal('0.00') <= self.rating <= Decimal('5.00')):
            raise ValidationError({'rating': 'Rating must be between 0 and 5.'})

    def __str__(self):
        return f"{self.brand} {self.product_name} ({self.product_id})"


class ProductImage(models.Model):
    IMAGE_TYPE_CHOICES = [
        ('front', 'Front View'),
        ('side', 'Side View'),
        ('rear', 'Rear/Back View'),
        ('keyboard', 'Keyboard/Top View'),
        ('angled', 'Angled View'),
        ('other', 'Other View'),
    ]
    SOURCE_TYPE_CHOICES = [
        ('verified_external', 'Verified External'),
        ('ai_generated', 'AI-Generated Visualization'),
    ]

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image_url = models.URLField(max_length=500)
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPE_CHOICES, default='front')
    source_type = models.CharField(max_length=30, choices=SOURCE_TYPE_CHOICES, default='ai_generated')
    display_order = models.PositiveIntegerField(default=1)
    is_primary = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'product_images'
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"Image ({self.image_type}) for {self.product_id} [{self.source_type}, order={self.display_order}]"

