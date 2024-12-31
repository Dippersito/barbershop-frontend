# core/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'barbers', views.BarberViewSet, basename='barber')
router.register(r'haircuts', views.HaircutViewSet, basename='haircut')
router.register(r'reservations', views.ReservationViewSet, basename='reservation')

urlpatterns = [
    path('auth/login/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('license/activate/', views.LicenseActivationView.as_view(), name='license_activate'),
    path('', include(router.urls)),
]