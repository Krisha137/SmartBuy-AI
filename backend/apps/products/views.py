import re
from decimal import Decimal
from django.db.models import Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from apps.products.models import Product
from apps.products.serializers import ProductSerializer, ProductQAInputSerializer
from services.ai.product_qa import ProductQAService


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Product.objects.all().order_by('-created_at')
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'product_id'

    ALLOWED_ORDERING_FIELDS = {
        'price': 'price',
        '-price': '-price',
        'rating': 'rating',
        '-rating': '-rating',
        'weight_kg': 'weight_kg',
        '-weight_kg': '-weight_kg',
        'battery_life': 'battery_life',
        '-battery_life': '-battery_life',
        'created_at': 'created_at',
        '-created_at': '-created_at',
    }

    def get_queryset(self):
        queryset = Product.objects.all()
        params = self.request.query_params

        # Exact match filters
        if 'brand' in params and params['brand'].strip():
            queryset = queryset.filter(brand__iexact=params['brand'].strip())

        if 'product_segment' in params and params['product_segment'].strip():
            queryset = queryset.filter(product_segment__iexact=params['product_segment'].strip())

        if 'ram_gb' in params and params['ram_gb'].strip():
            try:
                queryset = queryset.filter(ram_gb=int(params['ram_gb'].strip()))
            except ValueError:
                pass

        if 'storage_gb' in params and params['storage_gb'].strip():
            try:
                queryset = queryset.filter(storage_gb=int(params['storage_gb'].strip()))
            except ValueError:
                pass

        if 'storage_type' in params and params['storage_type'].strip():
            queryset = queryset.filter(storage_type__iexact=params['storage_type'].strip())

        if 'gpu_type' in params and params['gpu_type'].strip():
            queryset = queryset.filter(gpu_type__iexact=params['gpu_type'].strip())

        if 'operating_system' in params and params['operating_system'].strip():
            queryset = queryset.filter(operating_system__icontains=params['operating_system'].strip())

        if 'release_year' in params and params['release_year'].strip():
            try:
                queryset = queryset.filter(release_year=int(params['release_year'].strip()))
            except ValueError:
                pass

        # Range / Threshold filters
        if 'min_price' in params and params['min_price'].strip():
            try:
                queryset = queryset.filter(price__gte=Decimal(params['min_price'].strip()))
            except Exception:
                pass

        if 'max_price' in params and params['max_price'].strip():
            try:
                queryset = queryset.filter(price__lte=Decimal(params['max_price'].strip()))
            except Exception:
                pass

        if 'min_ram' in params and params['min_ram'].strip():
            try:
                queryset = queryset.filter(ram_gb__gte=int(params['min_ram'].strip()))
            except ValueError:
                pass

        if 'min_storage' in params and params['min_storage'].strip():
            try:
                queryset = queryset.filter(storage_gb__gte=int(params['min_storage'].strip()))
            except ValueError:
                pass

        if 'min_rating' in params and params['min_rating'].strip():
            try:
                queryset = queryset.filter(rating__gte=Decimal(params['min_rating'].strip()))
            except Exception:
                pass

        if 'max_weight' in params and params['max_weight'].strip():
            try:
                queryset = queryset.filter(weight_kg__lte=Decimal(params['max_weight'].strip()))
            except Exception:
                pass

        if 'min_battery_life' in params and params['min_battery_life'].strip():
            try:
                queryset = queryset.filter(battery_life__gte=Decimal(params['min_battery_life'].strip()))
            except Exception:
                pass

        # Multi-term text & spec search against product_name, brand, processor, gpu, product_segment, os, storage_type, ram_gb, storage_gb
        if 'search' in params and params['search'].strip():
            search_query = params['search'].strip()
            terms = [t for t in re.split(r'\s+', search_query) if t]
            for term in terms:
                term_q = (
                    Q(product_name__icontains=term) |
                    Q(brand__icontains=term) |
                    Q(processor__icontains=term) |
                    Q(gpu__icontains=term) |
                    Q(gpu_type__icontains=term) |
                    Q(product_segment__icontains=term) |
                    Q(operating_system__icontains=term) |
                    Q(storage_type__icontains=term)
                )
                # Match RAM patterns like "16gb", "16-gb", "16"
                ram_match = re.match(r'^(\d+)(?:gb)?$', term, re.IGNORECASE)
                if ram_match:
                    try:
                        ram_val = int(ram_match.group(1))
                        if ram_val in [4, 8, 12, 16, 24, 32, 64]:
                            term_q |= Q(ram_gb=ram_val)
                    except ValueError:
                        pass
                # Match Storage patterns like "512gb", "1tb", "256gb", "2tb"
                storage_match = re.match(r'^(\d+)(?:gb|tb)$', term, re.IGNORECASE)
                if storage_match:
                    try:
                        s_val = int(storage_match.group(1))
                        if 'tb' in term.lower():
                            s_val *= 1024
                        term_q |= Q(storage_gb=s_val)
                    except ValueError:
                        pass
                queryset = queryset.filter(term_q)

        # Ordering
        if 'ordering' in params and params['ordering'].strip():
            ordering_param = params['ordering'].strip()
            if ordering_param in self.ALLOWED_ORDERING_FIELDS:
                queryset = queryset.order_by(self.ALLOWED_ORDERING_FIELDS[ordering_param])
            else:
                queryset = queryset.order_by('-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs[lookup_url_kwarg]
        try:
            return Product.objects.get(product_id=lookup_val)
        except Product.DoesNotExist:
            raise NotFound(f"Product with ID '{lookup_val}' not found.")

    @action(detail=True, methods=['post'], url_path='ask')
    def ask_question(self, request, product_id=None):
        product = self.get_object()

        serializer = ProductQAInputSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            if isinstance(first_err, list):
                first_err = first_err[0]
            return Response(
                {"error": str(first_err)},
                status=status.HTTP_400_BAD_REQUEST
            )

        question = serializer.validated_data['question']
        qa_service = ProductQAService()
        result = qa_service.answer_question(product, question)
        return Response(result, status=status.HTTP_200_OK)


class CategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        categories = Product.objects.values_list('category', flat=True).distinct().order_by('category')
        categories_list = [cat for cat in categories if cat]
        return Response({'categories': categories_list, 'count': len(categories_list)})


class ProductSegmentListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        segments = Product.objects.values_list('product_segment', flat=True).distinct().order_by('product_segment')
        segments_list = [seg for seg in segments if seg]
        return Response({'product_segments': segments_list, 'count': len(segments_list)})


class BrandListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        brands = Product.objects.values_list('brand', flat=True).distinct().order_by('brand')
        brands_list = [b for b in brands if b]
        return Response({'brands': brands_list, 'count': len(brands_list)})
