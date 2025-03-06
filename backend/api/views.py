from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone

from .models import Alumno, Cuota, CuotaAlumno, Ejercicio, EjercicioAlumno
from .serializers import (
    UserSerializer, AlumnoSerializer, CuotaSerializer, 
    CuotaAlumnoSerializer, EjercicioSerializer, EjercicioAlumnoSerializer
)
from django.contrib.auth.models import User

class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

# --- Alumno ---
class AlumnoView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Alumno.objects.all()
    serializer_class = AlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Alumno.objects.filter(agregado_por=user)

    def perform_update(self, serializer):
        serializer.save(agregado_por=self.request.user)

class AlumnoListView(generics.ListCreateAPIView):  # For creating new Alumnos
    queryset = Alumno.objects.all()
    serializer_class = AlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Alumno.objects.filter(agregado_por=user)

    def perform_create(self, serializer):
        serializer.save(agregado_por=self.request.user)


# --- Cuota ---
class CuotaView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Cuota.objects.all()
    serializer_class = CuotaSerializer
    permission_classes = [permissions.IsAuthenticated]

class CuotaListView(generics.ListCreateAPIView):
    queryset = Cuota.objects.all()
    serializer_class = CuotaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()
        year = self.request.query_params.get('year')
        month = self.request.query_params.get('month')
        
        if year:
            queryset = queryset.filter(year=year)
        if month:
            queryset = queryset.filter(month=month)
            
        return queryset


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unpaid_students(request, cuota_id):
    # Get the cuota
    cuota = get_object_or_404(Cuota, id=cuota_id)
    
    # Get all alumnos
    alumnos = Alumno.objects.filter(activo=True)
    
    # Get the ids of alumnos who have paid this cuota
    paid_alumno_ids = CuotaAlumno.objects.filter(
        cuota=cuota,
        pagada=True
    ).values_list('alumno_id', flat=True)
    
    # Filter alumnos who haven't paid
    unpaid_alumnos = alumnos.exclude(id__in=paid_alumno_ids)
    
    serializer = AlumnoSerializer(unpaid_alumnos, many=True)
    return Response(serializer.data)

# --- CuotaAlumno ---
class CuotaAlumnoView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CuotaAlumno.objects.all()
    serializer_class = CuotaAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CuotaAlumno.objects.filter(alumno__agregado_por=user)

    def perform_update(self, serializer):
        serializer.save()

class CuotaAlumnoListView(generics.ListCreateAPIView):
    queryset = CuotaAlumno.objects.all()
    serializer_class = CuotaAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CuotaAlumno.objects.filter(alumno__agregado_por=self.request.user)

    def perform_create(self, serializer):
        # Obtiene alumno y cuota
        alumno = get_object_or_404(Alumno, 
                                id=self.request.data.get('alumno'), 
                                agregado_por=self.request.user)
        cuota = get_object_or_404(Cuota, id=self.request.data.get('cuota'))
        
        # Crea instancia de cuota alumno
        cuota_alumno = CuotaAlumno(
            alumno=alumno,
            cuota=cuota,
            plan=self.request.data.get('plan'),
            pagada=self.request.data.get('pagada', False),
            descuento=self.request.data.get('descuento', 0),
            fecha_pago=self.request.data.get('fecha_pago'),
            fecha_vencimiento_cuota=self.request.data.get('fecha_vencimiento_cuota')
        )
        
        # Si se pagó asigna la fecha de pago y el vencimiento
        if cuota_alumno.pagada:
            cuota_alumno.monto_pagado = cuota_alumno.monto_final_cuota()
            
            # En caso de no tener definida la fecha de pago
            if not cuota_alumno.fecha_pago:
                cuota_alumno.fecha_pago = timezone.now().date()
            
            # Define fecha de vencimiento si no está definida previamente (posible problema con el save del model)
            if not cuota_alumno.fecha_vencimiento_cuota:
                cuota_alumno.fecha_vencimiento_cuota = cuota_alumno.calcular_fecha_vencimiento()
        
        cuota_alumno.save()
        return Response(CuotaAlumnoSerializer(cuota_alumno).data)



# --- Ejercicio ---
class EjercicioView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer
    permission_classes = [permissions.AllowAny]

class EjercicioListView(generics.ListCreateAPIView):
    queryset = Ejercicio.objects.all()
    serializer_class = EjercicioSerializer
    permission_classes = [permissions.AllowAny]

# --- EjercicioAlumno ---
class EjercicioAlumnoView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EjercicioAlumno.objects.all()
    serializer_class = EjercicioAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return EjercicioAlumno.objects.filter(alumno__agregado_por=user)

    def perform_update(self, serializer):
        serializer.save()
        
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=204)

class EjercicioAlumnoListView(generics.ListCreateAPIView):
    serializer_class = EjercicioAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = EjercicioAlumno.objects.filter(alumno__agregado_por=user)
        
        # Allow filtering by alumno or ejercicio
        alumno_id = self.request.query_params.get('alumno')
        ejercicio_id = self.request.query_params.get('ejercicio')
        
        if alumno_id:
            queryset = queryset.filter(alumno_id=alumno_id)
        if ejercicio_id:
            queryset = queryset.filter(ejercicio_id=ejercicio_id)
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        alumno = Alumno.objects.get(id=self.request.data.get('alumno'))
        if alumno.agregado_por == user:
            serializer.save(alumno=alumno)
        else:
            raise ValueError("No puedes asociar un ejercicio a un alumno que no te pertenece.")