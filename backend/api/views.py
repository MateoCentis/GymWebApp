from rest_framework import generics, permissions, serializers
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Prefetch
from rest_framework.decorators import api_view, permission_classes
from django.utils import timezone
from django.core.serializers import serialize
import json
from django.db import models
from datetime import date

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
        try:
            # Log what's happening
            print(f"Updating CuotaAlumno: {serializer.instance} with data: {serializer.validated_data}")
            
            # Make sure we can access the same alumno when updating
            alumno = serializer.instance.alumno
            
            # Validate that the user owns this alumno
            if alumno.agregado_por != self.request.user:
                raise serializers.ValidationError("No puedes modificar una cuota de un alumno que no te pertenece")
            
            # Save the update
            serializer.save()
        except Exception as e:
            # Log any errors
            print(f"Error updating CuotaAlumno: {str(e)}")
            raise serializers.ValidationError(f"Error al actualizar cuota de alumno: {str(e)}")

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)  # Always use partial updates
        instance = self.get_object()
        
        # Get the minimal required data for the update
        update_data = {}
        
        # Always include these fields from the instance if not in the request
        if 'pagada' in request.data:
            update_data['pagada'] = request.data['pagada']
        
        if 'plan' in request.data:
            update_data['plan'] = request.data['plan']
        else:
            update_data['plan'] = instance.plan
            
        if 'alumno' in request.data:
            update_data['alumno'] = request.data['alumno']
        else:
            update_data['alumno'] = instance.alumno.id
            
        if 'cuota' in request.data:
            update_data['cuota'] = request.data['cuota']
        else:
            update_data['cuota'] = instance.cuota.id
            
        # Include any other fields that were sent
        for field in request.data:
            if field not in update_data:
                update_data[field] = request.data[field]
                
        serializer = self.get_serializer(instance, data=update_data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)

    def perform_destroy(self, instance):
        """
        Override perform_destroy to add custom logic before deletion
        """
        # Log the deletion
        print(f"Deleting CuotaAlumno: {instance}")
        
        # Ensure the authenticated user is the owner of the alumno
        if instance.alumno.agregado_por != self.request.user:
            raise serializers.ValidationError("No puedes eliminar una cuota de un alumno que no te pertenece")
            
        # Perform the deletion
        instance.delete()

class CuotaAlumnoListView(generics.ListCreateAPIView):
    queryset = CuotaAlumno.objects.all()
    serializer_class = CuotaAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return CuotaAlumno.objects.filter(alumno__agregado_por=self.request.user)

    def perform_create(self, serializer):
        try:
            # Obtiene alumno y cuota
            alumno = get_object_or_404(Alumno, 
                                    id=self.request.data.get('alumno'), 
                                    agregado_por=self.request.user)
            cuota = get_object_or_404(Cuota, id=self.request.data.get('cuota'))
            
            # Save the CuotaAlumno instance using the serializer instead of manually creating
            serializer.save(alumno=alumno, cuota=cuota)
            
        except Exception as e:
            # Log the error and raise a more descriptive exception
            print(f"Error creating CuotaAlumno: {str(e)}")
            raise serializers.ValidationError(f"Error al crear cuota de alumno: {str(e)}")



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

# Para página alumno info
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def alumno_detail(request, alumno_id):
    # Get the alumno with validation
    alumno = get_object_or_404(Alumno, id=alumno_id, agregado_por=request.user)
    
    # Get related cuotas with cuota details
    cuotas_alumno = list(CuotaAlumno.objects.filter(alumno=alumno).select_related('cuota'))
    
    # Get related ejercicios with ejercicio details
    ejercicios_alumno = list(EjercicioAlumno.objects.filter(alumno=alumno).select_related('ejercicio'))
    
    # Create the response data structure
    alumno_data = AlumnoSerializer(alumno).data
    
    # Add cuotas data with nested cuota info
    alumno_data['cuotas_alumno'] = []
    for cuota_alumno in cuotas_alumno:
        cuota_data = CuotaAlumnoSerializer(cuota_alumno).data
        cuota_data['cuota_info'] = {
            'month': cuota_alumno.cuota.month,
            'year': cuota_alumno.cuota.year
        }
        alumno_data['cuotas_alumno'].append(cuota_data)
    
    # Add ejercicios data with nested ejercicio info
    alumno_data['ejercicios_alumno'] = []
    for ejercicio_alumno in ejercicios_alumno:
        ejercicio_data = EjercicioAlumnoSerializer(ejercicio_alumno).data
        ejercicio_data['ejercicio_info'] = {
            'nombre': ejercicio_alumno.ejercicio.nombre,
            'descripcion': ejercicio_alumno.ejercicio.descripcion,
            'imagen': ejercicio_alumno.ejercicio.imagen.url if ejercicio_alumno.ejercicio.imagen else None
        }
        alumno_data['ejercicios_alumno'].append(ejercicio_data)
    
    return Response(alumno_data)

# --- Statistics Endpoints ---
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_available_years(request):
    """Return all years for which we have data (cuotas and ejercicios)"""
    try:
        cuota_years = Cuota.objects.values_list('year', flat=True).distinct().order_by('year')
        ejercicio_years = EjercicioAlumno.objects.dates('fecha', 'year').values_list('year', flat=True)
        
        # Combine and deduplicate years
        all_years = set(list(cuota_years) + list(ejercicio_years))
        
        # Ensure we have at least the current year
        if not all_years:
            all_years = {date.today().year}
            
        return Response({
            'years': sorted(list(all_years))
        })
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_monthly_income(request):
    """Get monthly income data for a specific year"""
    try:
        year = request.query_params.get('year', date.today().year)
        
        monthly_data = []
        for month in range(1, 13):
            # Get cuota for this month/year
            try:
                cuota = Cuota.objects.get(year=year, month=month)
                
                # Get all cuota_alumnos for this cuota
                cuota_alumnos = CuotaAlumno.objects.filter(cuota=cuota)
                total_alumnos = Alumno.objects.filter(activo=True).count()
                students_who_paid = cuota_alumnos.filter(pagada=True).count()
                
                # Calculate total income
                total_income = cuota_alumnos.filter(pagada=True).aggregate(
                    total=models.Sum('monto_pagado'))['total'] or 0
                    
                paid_percentage = (students_who_paid / total_alumnos * 100) if total_alumnos > 0 else 0
                
                monthly_data.append({
                    'month': month,
                    'year': int(year),
                    'totalIncome': total_income,
                    'paidPercentage': paid_percentage,
                    'totalStudents': total_alumnos,
                    'studentsWhoHavePaid': students_who_paid
                })
            except Cuota.DoesNotExist:
                # No cuota for this month, add zeros
                monthly_data.append({
                    'month': month,
                    'year': int(year),
                    'totalIncome': 0,
                    'paidPercentage': 0,
                    'totalStudents': 0,
                    'studentsWhoHavePaid': 0
                })
        
        return Response(monthly_data)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_plan_distribution(request):
    """Get distribution of plans chosen by students for a specific year"""
    year = request.query_params.get('year', date.today().year)
    
    plan_counts = []
    for plan_days in [2, 3, 4, 5]:
        # Count cuota_alumnos with this plan in the selected year
        count = CuotaAlumno.objects.filter(
            cuota__year=year,
            pagada=True,
            plan=plan_days
        ).count()
        
        plan_counts.append({
            'plan': plan_days,
            'count': count
        })
    
    return Response(plan_counts)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_exercise_stats(request):
    """Get statistics about exercises for a specific year"""
    year = request.query_params.get('year', date.today().year)
    
    # Get all exercises
    ejercicios = Ejercicio.objects.all()
    
    exercise_stats = []
    for ejercicio in ejercicios:
        # Count records for this exercise in the selected year
        ejercicio_alumnos = EjercicioAlumno.objects.filter(
            ejercicio=ejercicio,
            fecha__year=year
        )
        
        count = ejercicio_alumnos.count()
        
        if count > 0:
            # Calculate average weight
            avg_weight = ejercicio_alumnos.aggregate(
                avg=models.Avg('peso_repeticion_maxima'))['avg'] or 0
            
            exercise_stats.append({
                'exerciseName': ejercicio.nombre,
                'count': count,
                'averageWeight': round(avg_weight, 2)
            })
    
    # Sort by count (popularity) in descending order
    exercise_stats.sort(key=lambda x: x['count'], reverse=True)
    
    # Return top 5 or all if less than 5
    return Response(exercise_stats[:5])

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_student_progression(request):
    """Get top students with the best progression in exercises"""
    year = request.query_params.get('year', date.today().year)
    
    # This would typically involve more complex logic to calculate progression
    # For this example, we'll create a simplified calculation
    
    top_students = []
    
    # Get all students
    alumnos = Alumno.objects.filter(activo=True)
    
    for alumno in alumnos:
        # Get all ejercicio records for this student
        ejercicio_alumnos = EjercicioAlumno.objects.filter(
            alumno=alumno,
            fecha__year=year
        )
        
        # Group by ejercicio to find improvements
        ejercicio_ids = ejercicio_alumnos.values_list('ejercicio', flat=True).distinct()
        
        for ejercicio_id in ejercicio_ids:
            records = ejercicio_alumnos.filter(ejercicio=ejercicio_id).order_by('fecha')
            
            if records.count() >= 2:  # Need at least 2 records to calculate improvement
                first_record = records.first()
                last_record = records.last()
                
                if first_record and last_record and first_record.peso_repeticion_maxima > 0:
                    # Calculate percentage improvement
                    improvement_percent = ((last_record.peso_repeticion_maxima - first_record.peso_repeticion_maxima) / 
                                          first_record.peso_repeticion_maxima * 100)
                    
                    # Get exercise name
                    ejercicio = Ejercicio.objects.get(id=ejercicio_id)
                    
                    top_students.append({
                        'studentName': alumno.nombre_apellido,
                        'exerciseName': ejercicio.nombre,
                        'improvement': round(improvement_percent, 2)
                    })
    
    # Sort by improvement in descending order
    top_students.sort(key=lambda x: x['improvement'], reverse=True)
    
    # Return top 5 or all if less than 5
    return Response(top_students[:5])

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_monthly_plans(request):
    """Get plan distribution data for each month of a specific year"""
    try:
        year = request.query_params.get('year', date.today().year)
        
        monthly_plans = []
        for month in range(1, 13):
            # Get cuota for this month/year
            try:
                cuota = Cuota.objects.get(year=year, month=month)
                
                # Get plan distributions for this month
                plan_counts = []
                for plan_days in [2, 3, 4, 5]:
                    # Count cuota_alumnos with this plan in the selected month
                    count = CuotaAlumno.objects.filter(
                        cuota=cuota,
                        pagada=True,
                        plan=plan_days
                    ).count()
                    
                    plan_counts.append({
                        'plan': plan_days,
                        'count': count
                    })
                
                monthly_plans.append({
                    'month': month,
                    'planDistribution': plan_counts
                })
            except Cuota.DoesNotExist:
                # No cuota for this month, add empty plan distribution
                monthly_plans.append({
                    'month': month,
                    'planDistribution': [
                        {'plan': 2, 'count': 0},
                        {'plan': 3, 'count': 0},
                        {'plan': 4, 'count': 0},
                        {'plan': 5, 'count': 0}
                    ]
                })
        
        return Response(monthly_plans)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
