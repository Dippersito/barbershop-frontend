# core/serializers.py
from rest_framework import serializers
from .models import License, Barbershop, Barber, Haircut, Reservation
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime


class LicenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = License
        fields = ('key', 'is_active', 'machine_id', 'activated_at', 'expires_at')

class BarbershopSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barbershop
        fields = ('id', 'name', 'license', 'owner', 'created_at')

class BarberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Barber
        fields = ('id', 'name', 'barbershop', 'is_active', 'created_at')
        read_only_fields = ('created_at', 'barbershop')

class HaircutSerializer(serializers.ModelSerializer):
    barber_name = serializers.CharField(source='barber.name', read_only=True)

    class Meta:
        model = Haircut
        fields = ('id', 'barber', 'client_name', 'payment_method', 
                 'amount', 'created_at', 'barber_name', 'barbershop')
        read_only_fields = ('created_at', 'barbershop')

    def create(self, validated_data):
        request = self.context.get('request')
        barbershop = Barbershop.objects.get(owner=request.user)
        validated_data['barbershop'] = barbershop
        return super().create(validated_data)
    
class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ('id', 'client_name', 'date', 'time', 'details', 'is_active', 'created_at')
        read_only_fields = ('created_at', 'is_active')

    def validate(self, data):
        # Validar que la hora sea cada 30 minutos
        time = data.get('time')
        if time and time.minute % 30 != 0:
            raise serializers.ValidationError(
                {"time": "Las reservas solo pueden hacerse cada 30 minutos"}
            )

        # Validar que la fecha y hora no estén en el pasado
        now = timezone.localtime(timezone.now())
        reservation_datetime = timezone.make_aware(
            datetime.combine(data['date'], data['time']),
            timezone.get_current_timezone()
        )
        
        if reservation_datetime < now:
            raise serializers.ValidationError(
                {"date": "No se pueden hacer reservas para fechas/horas pasadas"}
            )

        # Verificar si ya existe una reserva para esa fecha y hora
        try:
            barbershop = Barbershop.objects.get(owner=self.context['request'].user)
            if Reservation.objects.filter(
                barbershop=barbershop,
                date=data['date'],
                time=data['time'],
                is_active=True
            ).exists():
                raise serializers.ValidationError(
                    {"time": "Ya existe una reserva para esta fecha y hora"}
                )
        except Barbershop.DoesNotExist:
            raise serializers.ValidationError(
                {"error": "No se encontró una barbería asociada a este usuario"}
            )

        return data