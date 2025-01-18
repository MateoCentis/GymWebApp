from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from .serializers import UserSerializer, AlumnoSerializer, CuotaSerializer, CuotaAlumnoSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Alumno, Cuota, CuotaAlumno

class CreateUserView(generics.CreateAPIView):
    querySet = User.objects.all()#Lista de todos los objetos, así no creamos uno repetido
    serializer_class = UserSerializer #Que data aceptamos para crear un nuevo usuario
    permission_classes = [AllowAny] #Quien puede crear un nuevo usuario
    
# Se usa ListCreate ya que te lista todos objetos del usuario y además permite crear nuevos
class CreateAlumnoView(generics.ListCreateAPIView):
    serializer_class = AlumnoSerializer
    permission_classes = [IsAuthenticated] 
    
    def get_queryset(self):
        user = self.request.user
        return Alumno.objects.filter(agregado_por=user)#Se trae solo los alumnos creados por el user
    
    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(agregado_por=self.request.user)
        else:
            print(serializer.errors)
            

class DeleteAlumnoView(generics.DestroyAPIView):
    serializer_class = AlumnoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return Alumno.objects.filter(agregado_por=user)#Se trae solo los alumnos creados por el user

class CreateCuotaView(generics.ListCreateAPIView):
    serializer_class = CuotaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Cuota.objects.all()
    
class DeleteCuotaView(generics.DestroyAPIView):
    serializer_class = CuotaSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        return Cuota.objects.all()
    
class CreateCuotaAlumnoView(generics.ListCreateAPIView):
    serializer_class = CuotaAlumnoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Se filtran las cuotas de los alumnos que son propiedad del usuario autenticado
        user = self.request.user
        return CuotaAlumno.objects.filter(alumno__agregado_por=user)
    
    def perform_create(self, serializer):
        # Cuando se crea una nueva CuotaAlumno, asociarla al alumno correspondiente
        user = self.request.user
        alumno = self.request.data.get('alumno')  # Suponiendo que el 'alumno' es un campo en el request
        if alumno:
            # Validar que el alumno realmente pertenece al usuario
            alumno_instance = Alumno.objects.get(id=alumno)
            if alumno_instance.agregado_por == user:
                serializer.save(alumno=alumno_instance)
            else:
                raise ValueError("No puedes asociar una cuota a un alumno que no te pertenece.")
        else:
            raise ValueError("Se requiere un ID de alumno.")
            
class DeleteCuotaAlumnoView(generics.DestroyAPIView):
    serializer_class = CuotaAlumnoSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Se filtran las cuotas de los alumnos que son propiedad del usuario autenticado
        user = self.request.user
        return CuotaAlumno.objects.filter(alumno__agregado_por=user)
