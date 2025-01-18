from django.core.management.base import BaseCommand
from api.services.cuota_service import generar_cuotas_mensuales

class Command(BaseCommand):
    help = "Genera cuotas mensuales para los alumnos activos."

    def handle(self, *args, **kwargs):
        try:
            generar_cuotas_mensuales()
            self.stdout.write(self.style.SUCCESS("Cuotas mensuales generadas correctamente."))
        except Exception as e:
            self.stderr.write(self.style.ERROR(f"Error al generar cuotas: {e}"))
