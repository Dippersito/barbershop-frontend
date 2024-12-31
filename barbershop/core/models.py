# core/models.py
from django.db import models
from django.contrib.auth.models import User
import uuid
from django.utils import timezone


class License(models.Model):
    key = models.UUIDField(default=uuid.uuid4, unique=True)
    machine_id = models.CharField(max_length=255, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    activated_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"License {self.key}"

    def is_valid(self):
        return self.is_active and self.expires_at > timezone.now()
    
class Barbershop(models.Model):
    name = models.CharField(max_length=255)
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    license = models.OneToOneField(License, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Barber(models.Model):
    name = models.CharField(max_length=255)
    barbershop = models.ForeignKey(Barbershop, on_delete=models.CASCADE, related_name='barbers')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.barbershop.name}"

class Haircut(models.Model):
    PAYMENT_CHOICES = [
        ('CASH', 'Efectivo'),
        ('YAPE', 'Yape'),
    ]
    
    barbershop = models.ForeignKey(Barbershop, on_delete=models.CASCADE, related_name='haircuts')
    barber = models.ForeignKey(Barber, on_delete=models.CASCADE, related_name='haircuts')
    client_name = models.CharField(max_length=255, blank=True, null=True)
    payment_method = models.CharField(max_length=10, choices=PAYMENT_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        client = self.client_name or "Cliente anónimo"
        return f"Corte de {client} por {self.barber.name}"

class Reservation(models.Model):
    barbershop = models.ForeignKey('Barbershop', on_delete=models.CASCADE)
    client_name = models.CharField(max_length=255)
    date = models.DateField()
    time = models.TimeField()
    details = models.TextField(blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['date', 'time']
        unique_together = ['barbershop', 'date', 'time']

    def __str__(self):
        return f"Reserva de {self.client_name} para {self.date} {self.time}"

    def save(self, *args, **kwargs):
        # Asegurarse de que el tiempo esté redondeado a 30 minutos
        minutes = self.time.minute
        rounded_minutes = (minutes // 30) * 30
        self.time = self.time.replace(minute=rounded_minutes, second=0, microsecond=0)
        super().save(*args, **kwargs)