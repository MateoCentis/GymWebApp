from rest_framework import generics, permissions
from .models import Alumno, Cuota, CuotaAlumno, Ejercicio, EjercicioAlumno
from .serializers import UserSerializer, AlumnoSerializer, CuotaSerializer, CuotaAlumnoSerializer, EjercicioSerializer, EjercicioAlumnoSerializer
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
    permission_classes = [permissions.AllowAny]

class CuotaListView(generics.ListCreateAPIView):
    queryset = Cuota.objects.all()
    serializer_class = CuotaSerializer
    permission_classes = [permissions.AllowAny]

# --- CuotaAlumno ---
class CuotaAlumnoView(generics.RetrieveUpdateDestroyAPIView):
    queryset = CuotaAlumno.objects.all()
    serializer_class = CuotaAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CuotaAlumno.objects.filter(alumno__agregado_por=user)

    def perform_update(self, serializer):
        serializer.save()  # No need to specify user here

class CuotaAlumnoListView(generics.ListCreateAPIView):
    queryset = CuotaAlumno.objects.all()
    serializer_class = CuotaAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return CuotaAlumno.objects.filter(alumno__agregado_por=user)

    def perform_create(self, serializer):
        user = self.request.user
        alumno = Alumno.objects.get(id=self.request.data.get('alumno'))  # Get alumno ID
        cuota = Cuota.objects.get(id=self.request.data.get('cuota'))  # Get cuota ID

        if alumno.agregado_por == user:
            plan = int(self.request.data.get('plan'))  # Get selected plan

            cuota_alumno = CuotaAlumno(alumno=alumno, cuota=cuota, plan=plan)
            monto_pagado = cuota_alumno.monto_final_cuota()  # Calculate monto_pagado
            cuota_alumno.monto_pagado = monto_pagado # Assign it

            cuota_alumno.save() # Save the object so the id exists
            serializer = CuotaAlumnoSerializer(cuota_alumno) # Serialize the object
            serializer.is_valid(raise_exception=True) # Check if the serialization is correct
            serializer.save() # Save the object
        else:
            raise serializers.ValidationError("No puedes asociar una cuota a un alumno que no te pertenece.") # Raise a validation error


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

class EjercicioAlumnoListView(generics.ListCreateAPIView):
    queryset = EjercicioAlumno.objects.all()
    serializer_class = EjercicioAlumnoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return EjercicioAlumno.objects.filter(alumno__agregado_por=user)

    def perform_create(self, serializer):
        user = self.request.user
        alumno = Alumno.objects.get(id=self.request.data.get('alumno'))
        if alumno.agregado_por == user:
            serializer.save(alumno=alumno)
        else:
            raise ValueError("No puedes asociar un ejercicio a un alumno que no te pertenece.")