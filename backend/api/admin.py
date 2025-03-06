from django.contrib import admin
from .models import Alumno, Cuota, CuotaAlumno, Ejercicio, EjercicioAlumno

# Register your models here.
@admin.register(Alumno)
class AlumnoAdmin(admin.ModelAdmin):
    pass

@admin.register(Cuota)
class CuotaAdmin(admin.ModelAdmin):
    pass

@admin.register(CuotaAlumno)
class CuotaAlumnoAdmin(admin.ModelAdmin):
    pass

@admin.register(Ejercicio)
class EjercicioAdmin(admin.ModelAdmin):
    pass

@admin.register(EjercicioAlumno)
class EjercicioAlumnoAdmin(admin.ModelAdmin):
    pass
