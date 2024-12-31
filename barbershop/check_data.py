# check_data.py
import os
import django

# Configurar el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'barbershop.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import License, Barbershop, Barber, Haircut, Reservation

def check_data():
    print("\n=== Usuarios ===")
    for user in User.objects.all():
        print(f"ID: {user.id}, Username: {user.username}")

    print("\n=== Licencias ===")
    for license in License.objects.all():
        print(f"ID: {license.id}, Key: {license.key}, Active: {license.is_active}")

    print("\n=== Barberías ===")
    for shop in Barbershop.objects.all():
        print(f"ID: {shop.id}, Name: {shop.name}, Owner: {shop.owner.username}")

    print("\n=== Barberos ===")
    for barber in Barber.objects.all():
        print(f"ID: {barber.id}, Name: {barber.name}, Shop: {barber.barbershop.name}")

    print("\n=== Cortes ===")
    for cut in Haircut.objects.all():
        print(f"ID: {cut.id}, Client: {cut.client_name}, Amount: {cut.amount}")

    print("\n=== Reservas ===")
    for res in Reservation.objects.all():
        print(f"ID: {res.id}, Client: {res.client_name}, Date: {res.date}")

if __name__ == "__main__":
    try:
        check_data()
    except Exception as e:
        print(f"Error: {str(e)}")