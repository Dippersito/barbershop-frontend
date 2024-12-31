# core/admin.py
from django.contrib import admin
from .models import License, Barbershop, Barber, Haircut, Reservation

@admin.register(License)
class LicenseAdmin(admin.ModelAdmin):
    list_display = ('key', 'is_active', 'machine_id', 'activated_at', 'expires_at')
    search_fields = ('key', 'machine_id')
    list_filter = ('is_active',)

@admin.register(Barbershop)
class BarbershopAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'created_at')
    search_fields = ('name', 'owner__username')

@admin.register(Barber)
class BarberAdmin(admin.ModelAdmin):
    list_display = ('name', 'barbershop', 'is_active', 'created_at')
    list_filter = ('is_active', 'barbershop')
    search_fields = ('name',)

@admin.register(Haircut)
class HaircutAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'barber', 'payment_method', 'amount', 'created_at')
    list_filter = ('payment_method', 'created_at')
    search_fields = ('client_name', 'barber__name')

@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('client_name', 'date', 'time', 'is_active', 'created_at')
    list_filter = ('is_active', 'date')
    search_fields = ('client_name',)