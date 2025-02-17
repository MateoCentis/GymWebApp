from django.db import models
from django.contrib.auth.models import User
from datetime import timedelta, date

# Ejercicios
class Ejercicio(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    # imagen = models.ImageField(upload_to="ejercicios/", null=True, blank=True)
    
    def __str__(self):
        return self.nombre

class EjercicioAlumno(models.Model):
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE)
    alumno = models.ForeignKey("Alumno", on_delete=models.CASCADE)
    fecha = models.DateField(auto_now_add=True)
    series = models.IntegerField()
    peso_repeticion_maxima = models.IntegerField(default=0)
    repeticiones = models.IntegerField()
    peso = models.FloatField()
    
    def __str__(self):
        return f"{self.ejercicio} - {self.alumno}"
    
# La lista de cuotas es única para todos los alumnos
class Cuota(models.Model):
    year = models.IntegerField(default=date.today().year)
    month = models.IntegerField(default=date.today().month)
    # En cada cuota hay cuatro montos posibles según la cantidad de días por semana (2, 3, 4, 5)
    monto_dos_dias = models.IntegerField()
    monto_tres_dias = models.IntegerField()
    monto_cuatro_dias = models.IntegerField()
    monto_cinco_dias = models.IntegerField()
    
    def __str__(self):
        return f"{self.month}/{self.year}" # Improved string representation

    class Meta:
        unique_together = ('year', 'month') # Ensure only one cuota per month/year
        pass

class Alumno(models.Model):
    
    def __str__(self):
        return str(self.nombre_apellido)
    
    agregado_por = models.ForeignKey(User, on_delete=models.CASCADE, related_name="alumnos")
    cuotas = models.ManyToManyField(Cuota, through="CuotaAlumno")
    ejercicios = models.ManyToManyField(Ejercicio, through="EjercicioAlumno")
    
    # foto = models.ImageField(upload_to="alumnos/", null=True, blank=True)
    nombre_apellido = models.CharField(max_length=100, blank=False)
    telefono = models.CharField(max_length=20)
    fecha_nacimiento = models.DateField(default=date.min)
    sexo = models.CharField(max_length=1, choices=[("M", "Masculino"), ("F", "Femenino")], default="M")
    peso = models.FloatField(default=0)
    altura = models.IntegerField(default=0)
    activo = models.BooleanField(default=True)
    
    def monto_total_cuotas_sin_pagar(self):
        cuotas_adeudadas = CuotaAlumno.objects.filter(alumno=self, pagada=False)
        return sum([cuota.monto_final_cuota() for cuota in cuotas_adeudadas])
    
    def monto_total_cuotas_pagadas(self):
        cuotas_pagadas = CuotaAlumno.objects.filter(alumno=self, pagada=True)
        return sum([cuota.monto_final_cuota() for cuota in cuotas_pagadas])
    
class CuotaAlumno(models.Model):
    
    alumno = models.ForeignKey(Alumno, on_delete=models.CASCADE)
    cuota = models.ForeignKey(Cuota, on_delete=models.CASCADE)
    
    pagada = models.BooleanField(default=False)  
    descuento = models.IntegerField(default=0) #Cuanto se le aplica de descuento al monto de la cuota a ese alumno
    plan = models.IntegerField(choices=[(2, "2 días"), (3, "3 días"), (4, "4 días"), (5, "5 días")])  # Add this field
    monto_pagado = models.IntegerField(null=True, blank=True)
    fecha_pago = models.DateField(null=True, blank=True)
    fecha_vencimiento_cuota = models.DateField(null=True, blank=True)
    
    # Calcula el monto final pagado por el alumno
    def monto_final_cuota(self):
        
        dias_monto = {
            2: self.cuota.monto_dos_dias,
            3: self.cuota.monto_tres_dias,
            4: self.cuota.monto_cuatro_dias,
            5: self.cuota.monto
        }
        
        try:
            monto_base = dias_monto[self.plan]
        except KeyError:
            raise ValueError("Cantidad de días por semana no válida.")

        return max(monto_base - self.descuento, 0)  # Asegura que el monto final no sea negativo
    
    def calcular_fecha_vencimiento(self):
        if not self.fecha_pago:
            return None 
        return self.fecha_pago + timedelta(days=30)
    
    def save(self, *args, **kwargs):
        if self.pagada and self.fecha_pago: ## Si se pagó y hay fecha de pago calcula la fecha de vencimiento
            self.fecha_vencimiento = self.calcular_fecha_vencimiento()
        if self.monto_pagado is None: #Si no hay monto pagado se le asigna el monto final de la cuota
            self.monto_pagado = self.monto_final_cuota()
        super().save(*args, **kwargs)
        
