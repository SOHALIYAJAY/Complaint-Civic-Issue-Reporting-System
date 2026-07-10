from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom exception handler for better error responses.
    Handles authentication and permission errors with detailed messages.
    """
    response = exception_handler(exc, context)

    if response is not None:
        # Add custom error format
        if response.status_code == status.HTTP_401_UNAUTHORIZED:
            response.data = {
                'success': False,
                'message': 'Authentication required. Please log in.',
                'error': str(exc),
            }
            response['WWW-Authenticate'] = 'Bearer'
        
        elif response.status_code == status.HTTP_403_FORBIDDEN:
            response.data = {
                'success': False,
                'message': 'You do not have permission to perform this action.',
                'error': str(exc),
            }
        
        elif response.status_code == status.HTTP_404_NOT_FOUND:
            response.data = {
                'success': False,
                'message': 'Resource not found.',
                'error': str(exc),
            }
        
        elif response.status_code == status.HTTP_400_BAD_REQUEST:
            response.data = {
                'success': False,
                'message': 'Invalid request.',
                'errors': response.data,
            }
        
        else:
            # For other errors, preserve the original response or add success flag
            if not isinstance(response.data, dict):
                response.data = {'message': str(response.data)}
            if 'success' not in response.data:
                response.data['success'] = False

    return response
