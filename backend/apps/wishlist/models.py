from django.db import models
from django.contrib.auth.models import User


class Wishlist(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='wishlist_items'
    )
    product = models.ForeignKey(
        'products.Product',
        on_delete=models.CASCADE,
        related_name='wishlisted_by'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'wishlist'
        unique_together = ('user', 'product')
        ordering = ['-created_at']

    def __str__(self):
        return f"Wishlist item {self.id}: {self.user.username} - {self.product_id}"
