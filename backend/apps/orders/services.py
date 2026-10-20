import uuid
from datetime import datetime
from django.db import transaction
from rest_framework.exceptions import ValidationError
from apps.cart.models import Cart
from .models import Order, OrderItem, OrderStatus


def generate_order_number():
    date_str = datetime.now().strftime('%Y%m%d')
    unique_suffix = uuid.uuid4().hex[:6].upper()
    return f"ORD-{date_str}-{unique_suffix}"


def create_order_from_cart(user, shipping_data):
    """
    Creates an Order and OrderItems from user's current Cart in PostgreSQL.
    Clears the cart upon success.
    Calculates all totals on the backend using actual Product prices.
    """
    with transaction.atomic():
        try:
            cart = Cart.objects.prefetch_related('items__product').get(user=user)
        except Cart.DoesNotExist:
            raise ValidationError({'cart': 'No active cart found.'})

        cart_items = cart.items.all()
        if not cart_items.exists():
            raise ValidationError({'cart': 'Your shopping cart is empty.'})

        # Calculate subtotal & line totals from database values
        subtotal = 0
        order_items_data = []

        for cart_item in cart_items:
            product = cart_item.product
            if not product:
                continue
            item_price = product.price
            item_quantity = cart_item.quantity
            line_total = item_price * item_quantity
            subtotal += line_total

            order_items_data.append({
                'product': product,
                'product_name': product.product_name,
                'price': item_price,
                'quantity': item_quantity,
                'line_total': line_total
            })

        if not order_items_data:
            raise ValidationError({'cart': 'No valid products in cart.'})

        order_number = generate_order_number()

        # Create Order record
        order = Order.objects.create(
            order_number=order_number,
            user=user,
            status=OrderStatus.CONFIRMED,
            subtotal=subtotal,
            total_amount=subtotal,
            currency='INR',
            customer_name=shipping_data.get('customer_name', '').strip(),
            email=shipping_data.get('email', '').strip(),
            phone=shipping_data.get('phone', '').strip(),
            address_line_1=shipping_data.get('address_line_1', '').strip(),
            address_line_2=shipping_data.get('address_line_2', '').strip(),
            city=shipping_data.get('city', '').strip(),
            state=shipping_data.get('state', '').strip(),
            postal_code=shipping_data.get('postal_code', '').strip(),
            country=shipping_data.get('country', 'India').strip() or 'India',
        )

        # Create OrderItems
        order_items = [
            OrderItem(
                order=order,
                product=item['product'],
                product_name=item['product_name'],
                price=item['price'],
                quantity=item['quantity'],
                line_total=item['line_total']
            )
            for item in order_items_data
        ]
        OrderItem.objects.bulk_create(order_items)

        # Clear cart items
        cart.items.all().delete()

        return order


def cancel_order(order, user):
    """
    Cancels an order if permitted by status.
    """
    if order.user != user:
        raise ValidationError({'order': 'Access denied.'})

    if not order.can_cancel():
        raise ValidationError({'order': f"Order cannot be cancelled in status '{order.status}'."})

    order.status = OrderStatus.CANCELLED
    order.save()
    return order
