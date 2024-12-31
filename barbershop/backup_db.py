# migrate_db.py
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "barbershop.settings")

import django
django.setup()

from django.contrib.auth.models import User
from core.models import License, Barbershop, Barber, Haircut, Reservation
import sqlite3
import psycopg2
from datetime import datetime

def get_sqlite_connection():
    return sqlite3.connect('db.sqlite3')

def get_postgres_connection():
    return psycopg2.connect(
        dbname="barbershop_db",
        user="postgres",
        password="tu_contraseña",  # Cambia esto por tu contraseña
        host="localhost",
        port="5432"
    )

def migrate_data():
    # Obtener datos de SQLite
    sqlite_conn = get_sqlite_connection()
    sqlite_cursor = sqlite_conn.cursor()
    
    # Migrar usuarios
    sqlite_cursor.execute("SELECT username, password, is_superuser, is_staff, is_active, date_joined FROM auth_user")
    users = sqlite_cursor.fetchall()
    
    # Insertar en PostgreSQL
    pg_conn = get_postgres_connection()
    pg_cursor = pg_conn.cursor()
    
    for user in users:
        pg_cursor.execute("""
            INSERT INTO auth_user (username, password, is_superuser, is_staff, is_active, date_joined)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, user)
    
    # Confirmar cambios
    pg_conn.commit()
    
    # Cerrar conexiones
    sqlite_conn.close()
    pg_conn.close()
    
    print("Migración completada")

if __name__ == "__main__":
    try:
        migrate_data()
    except Exception as e:
        print(f"Error durante la migración: {str(e)}")