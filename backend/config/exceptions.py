from rest_framework.views import exception_handler
from rest_framework.exceptions import NotFound, ValidationError, APIException
from rest_framework import status
from rest_framework.response import Response


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_response_data = {
            "error": {
                "code": getattr(exc, 'default_code', 'API_ERROR').upper(),
                "message": str(getattr(exc, 'detail', exc))
            }
        }

        if isinstance(response.data, dict):
            if 'detail' in response.data and isinstance(response.data['detail'], str):
                custom_response_data["error"]["message"] = response.data['detail']
            else:
                custom_response_data["error"]["code"] = "VALIDATION_ERROR"
                custom_response_data["error"]["message"] = "Invalid input data."
                custom_response_data["error"]["details"] = response.data

        response.data = custom_response_data
    else:
        # Fallback for unhandled server exceptions (500) without exposing stack traces
        response = Response(
            {
                "error": {
                    "code": "INTERNAL_SERVER_ERROR",
                    "message": "An internal server error occurred."
                }
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    return response
