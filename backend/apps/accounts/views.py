from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken

from apps.accounts.serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer
)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            if isinstance(first_err, list):
                first_err = first_err[0]
            return Response(
                {"error": str(first_err), "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            if isinstance(first_err, list):
                first_err = first_err[0]
            return Response(
                {"error": str(first_err), "details": serializer.errors},
                status=status.HTTP_401_UNAUTHORIZED
            )

        user = serializer.validated_data['user']
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        }, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            first_err = list(serializer.errors.values())[0]
            if isinstance(first_err, list):
                first_err = first_err[0]
            return Response(
                {"error": str(first_err), "details": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
