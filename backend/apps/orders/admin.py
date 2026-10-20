from django.contrib import admin
from .models import Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'price', 'quantity', 'line_total')
    can_delete = False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('order_number', 'user', 'status', 'total_amount', 'currency', 'customer_name', 'created_at')
    list_filter = ('status', 'currency', 'created_at')
    search_fields = ('order_number', 'user__username', 'customer_name', 'email', 'phone')
    readonly_fields = ('order_number', 'user', 'subtotal', 'total_amount', 'currency', 'created_at', 'updated_at')
    inlines = [OrderItemInline]
    ordering = ('-created_at',)
