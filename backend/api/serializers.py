from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Alumno, Cuota, CuotaAlumno, Ejercicio, EjercicioAlumno

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password"]
        # write_only le dice a django que no retorne el password cuando pedimos data del usuario
        extra_kwargs = {"password": {"write_only": True}}
        
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class AlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alumno
        fields = ["id","agregado_por", "nombre_apellido","fecha_nacimiento","peso","altura","sexo", "telefono", "activo", "cuotas","ejercicios"]
        extra_kwargs = {"agregado_por": {"read_only": True}}
        
class CuotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuota
        fields = ["id","month", "year", "monto_dos_dias", "monto_tres_dias", "monto_cuatro_dias", "monto_cinco_dias"]

class CuotaAlumnoSerializer(serializers.ModelSerializer):
    # alumno = AlumnoSerializer(read_only=True)
    # cuota = CuotaSerializer(read_only=True)
    class Meta:
        model = CuotaAlumno
        fields = ["id", "alumno", "cuota", "pagada", "descuento", "monto_pagado", "plan", "fecha_pago", "fecha_vencimiento_cuota"]
        
class EjercicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ejercicio
        fields = ["id","nombre", "descripcion", "imagen"]

class EjercicioAlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = EjercicioAlumno
        fields = ["id","alumno", "ejercicio", "fecha", "peso_repeticion_maxima"]