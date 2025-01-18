from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Alumno, Cuota, CuotaAlumno

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
        fields = ["agregado_por", "nombre_apellido", "telefono", "fecha_inicio_gym", "activo", "cuotas"]
        extra_kwargs = {"agregado_por": {"read_only": True}}
        
class CuotaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cuota
        fields = ["mes", "year", "monto_dos_dias", "monto_tres_dias", "monto_cuatro_dias", "monto_cinco_dias"]

class CuotaAlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CuotaAlumno
        fields = ["alumno", "cuota", "pagada", "descuento", "dias_por_semana", "fecha_pago", "fecha_vencimiento_cuota"]