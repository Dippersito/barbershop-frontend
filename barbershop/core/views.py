# core/views.py
from rest_framework import viewsets, status, serializers
from django.db import models
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.db.models import Sum, Count
from .models import License, Barbershop, Barber, Haircut, Reservation
from .serializers import (
    LicenseSerializer, BarbershopSerializer, BarberSerializer,
    HaircutSerializer, ReservationSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import HttpResponse
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from datetime import timedelta


# Vista para activar licencias
class LicenseActivationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        license_key = request.data.get('license_key')
        machine_id = request.data.get('machine_id')

        if not license_key or not machine_id:
            return Response({
                'error': 'Se requiere license_key y machine_id',
                'code': 'MISSING_DATA'
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Verificar si la licencia existe y está disponible
            new_license = License.objects.get(key=license_key)
            
            # Si la licencia ya está en uso en otra máquina
            if new_license.machine_id and new_license.machine_id != machine_id:
                return Response({
                    'error': 'Esta licencia ya está activa en otra máquina',
                    'code': 'LICENSE_IN_USE'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Verificar si ya existe una barbería usando esta máquina
            try:
                existing_barbershop = Barbershop.objects.get(license__machine_id=machine_id)
                existing_license = existing_barbershop.license

                # Si la licencia actual está vencida, actualizar a la nueva
                if not existing_license.is_valid():
                    # Desactivar la licencia anterior
                    existing_license.is_active = False
                    existing_license.save()

                    # Activar la nueva licencia
                    new_license.machine_id = machine_id
                    new_license.activated_at = timezone.now()
                    new_license.save()

                    # Actualizar la barbería con la nueva licencia
                    existing_barbershop.license = new_license
                    existing_barbershop.save()

                    return Response({
                        'message': 'Licencia actualizada exitosamente',
                        'expires_at': new_license.expires_at
                    })
                else:
                    return Response({
                        'error': 'Esta barbería ya tiene una licencia válida activa',
                        'code': 'ACTIVE_LICENSE_EXISTS',
                        'expires_at': existing_license.expires_at
                    }, status=status.HTTP_400_BAD_REQUEST)

            except Barbershop.DoesNotExist:
                # Si es una nueva activación
                new_license.machine_id = machine_id
                new_license.activated_at = timezone.now()
                new_license.save()

                return Response({
                    'message': 'Licencia activada exitosamente',
                    'expires_at': new_license.expires_at
                })

        except License.DoesNotExist:
            return Response({
                'error': 'Licencia no encontrada',
                'code': 'LICENSE_NOT_FOUND'
            }, status=status.HTTP_404_NOT_FOUND)
        
# Vista para gestionar barberos
class BarberViewSet(viewsets.ModelViewSet):
    serializer_class = BarberSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Barber.objects.filter(barbershop__owner=self.request.user)

    def perform_create(self, serializer):
        barbershop = Barbershop.objects.get(owner=self.request.user)
        serializer.save(barbershop=barbershop)

# Vista para gestionar cortes de cabello
class HaircutViewSet(viewsets.ModelViewSet):
    serializer_class = HaircutSerializer
    permission_classes = [IsAuthenticated]
    queryset = Haircut.objects.all()

    def get_queryset(self):
        return Haircut.objects.filter(barbershop__owner=self.request.user)

    def perform_create(self, serializer):
        barbershop = Barbershop.objects.get(owner=self.request.user)
        serializer.save(barbershop=barbershop)

    @action(detail=False, methods=['get'])
    def balance(self, request):
        today = timezone.now().date()
        period = request.query_params.get('period', 'daily')
        
        if period == 'daily':
            haircuts = self.get_queryset().filter(created_at__date=today)
        else:  # monthly
            month_start = today.replace(day=1)
            haircuts = self.get_queryset().filter(
                created_at__date__gte=month_start,
                created_at__date__lte=today
            )

        totals = {
            'totalIncome': sum(h.amount for h in haircuts),
            'totalCuts': haircuts.count(),
            'cashTotal': sum(h.amount for h in haircuts if h.payment_method == 'CASH'),
            'yapeTotal': sum(h.amount for h in haircuts if h.payment_method == 'YAPE')
        }

        return Response({
            f'{period}Stats': totals
        })

    @action(detail=False, methods=['get'])
    def report_pdf(self, request):
        try:
            start_date = request.query_params.get('startDate')
            end_date = request.query_params.get('endDate')
            
            haircuts = self.get_queryset().filter(
                created_at__date__range=[start_date, end_date]
            ).order_by('created_at')

            # Crear el buffer para el PDF
            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter)
            elements = []
            
            # Estilos
            styles = getSampleStyleSheet()
            elements.append(Paragraph(f"Reporte de Cortes", styles['Title']))
            elements.append(Spacer(1, 20))
            
            # Datos para la tabla
            data = [['Fecha', 'Cliente', 'Barbero', 'Método de Pago', 'Monto']]
            
            for haircut in haircuts:
                data.append([
                    haircut.created_at.strftime('%d/%m/%Y %H:%M'),
                    haircut.client_name or 'Cliente Anónimo',
                    haircut.barber.name,
                    'Efectivo' if haircut.payment_method == 'CASH' else 'Yape',
                    f'S/. {haircut.amount:.2f}'
                ])

            # Agregar totales
            total = sum(h.amount for h in haircuts)
            cash_total = sum(h.amount for h in haircuts if h.payment_method == 'CASH')
            yape_total = sum(h.amount for h in haircuts if h.payment_method == 'YAPE')

            data.extend([
                ['', '', '', 'Total Efectivo:', f'S/. {cash_total:.2f}'],
                ['', '', '', 'Total Yape:', f'S/. {yape_total:.2f}'],
                ['', '', '', 'Total General:', f'S/. {total:.2f}']
            ])

            # Crear y estilizar la tabla
            table = Table(data)
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 12),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, -3), (-1, -1), colors.lightgrey),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ]))

            elements.append(table)
            
            # Generar PDF
            doc.build(elements)
            buffer.seek(0)
            
            response = HttpResponse(buffer, content_type='application/pdf')
            filename = f'reporte_cortes_{start_date}_{end_date}.pdf'
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            
            return response

        except Exception as e:
            print(f"Error generando PDF: {str(e)}")
            return Response(
                {'error': 'Error generando el PDF'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['delete'])
    def delete_all(self, request):
        try:
            # Obtener todos los cortes de la barbería actual
            haircuts = self.get_queryset()
            deleted_count = haircuts.count()
            
            if deleted_count == 0:
                return Response({
                    'message': 'No hay registros para eliminar'
                }, status=status.HTTP_200_OK)

            # Eliminar los registros
            haircuts.delete()

            return Response({
                'message': f'Se eliminaron {deleted_count} registros correctamente',
                'deleted_count': deleted_count
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"Error al eliminar registros: {str(e)}")
            return Response(
                {'error': 'Error al eliminar los registros'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
# Vista para gestionar reservas
class ReservationViewSet(viewsets.ModelViewSet):
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]
    queryset = Reservation.objects.all()

    def get_queryset(self):
        return Reservation.objects.filter(
            barbershop__owner=self.request.user,
            is_active=True
        ).order_by('date', 'time')

    def perform_create(self, serializer):
        try:
            barbershop = Barbershop.objects.get(owner=self.request.user)
            serializer.save(barbershop=barbershop)
        except Barbershop.DoesNotExist:
            raise serializers.ValidationError(
                {"error": "No se encontró una barbería asociada a este usuario"}
            )

    
class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Obtener el usuario del token
            token_data = response.data
            from rest_framework_simplejwt.tokens import AccessToken
            token = AccessToken(token_data['access'])
            user_id = token.payload.get('user_id')
            
            from django.contrib.auth.models import User
            user = User.objects.get(id=user_id)
            
            # Crear licencia por defecto si no existe
            license, created = License.objects.get_or_create(
                defaults={
                    'is_active': True,
                    'expires_at': timezone.now() + timezone.timedelta(days=365)
                }
            )
            
            # Crear barbería si no existe para el usuario
            barbershop, created = Barbershop.objects.get_or_create(
                owner=user,
                defaults={
                    'name': f'Barbería de {user.username}',
                    'license': license
                }
            )
        
        return response