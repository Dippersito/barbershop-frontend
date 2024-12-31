# core/middleware.py
from django.http import JsonResponse
from core.models import License
import uuid
from django.http import JsonResponse
from django.urls import resolve
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.request import Request
from django.http import HttpRequest

class LicenseMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Lista de rutas exentas
        exempt_paths = [
            '/admin/',
            '/api/auth/',  # Esto cubrirá /api/auth/login/ y /api/auth/refresh/
            '/api/license/activate/',
        ]

        # Verificar si la ruta está exenta
        for path in exempt_paths:
            if request.path.startswith(path):
                return self.get_response(request)

        # Verificar autenticación para rutas de API
        if request.path.startswith('/api/'):
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                return self.get_response(request)

        # Para otras rutas, verificar licencia
        machine_id = request.headers.get('X-Machine-ID')
        if not machine_id:
            return JsonResponse({'error': 'Machine ID not provided'}, status=403)

        try:
            license = License.objects.get(machine_id=machine_id)
            if not license.is_valid():
                return JsonResponse({'error': 'Invalid or expired license'}, status=403)
        except License.DoesNotExist:
            return JsonResponse({'error': 'License not found'}, status=403)

        return self.get_response(request)