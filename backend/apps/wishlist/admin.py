from django.contrib import admin
from apps.wishlist.models import Wishlist


@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'product', 'created_at']
    search_fields = ['user__username', 'product__product_name', 'product__product_id']
    list_filter = ['created_at']
