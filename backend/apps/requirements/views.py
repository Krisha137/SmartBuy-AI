from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny
from rest_framework.exceptions import NotFound
from apps.requirements.models import Requirement
from apps.requirements.serializers import RequirementSerializer


class RequirementViewSet(mixins.CreateModelMixin,
                         mixins.RetrieveModelMixin,
                         viewsets.GenericViewSet):
    queryset = Requirement.objects.all().order_by('-created_at')
    serializer_class = RequirementSerializer
    permission_classes = [AllowAny]
    lookup_field = 'requirement_id'

    def get_object(self):
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup_val = self.kwargs[lookup_url_kwarg]
        try:
            return Requirement.objects.get(requirement_id=lookup_val)
        except Requirement.DoesNotExist:
            raise NotFound(f"Requirement with ID '{lookup_val}' not found.")
