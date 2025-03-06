from datetime import date
from django.core.management.base import BaseCommand
from api.models import Cuota

class Command(BaseCommand):
    help = 'Crea instancias de Cuota para todos los meses desde el mes actual hasta diciembre de 2050.'

    def handle(self, *args, **options):
        hoy = date.today()
        anio_actual = hoy.year
        mes_actual = hoy.month

        anio_fin = 2050

        for anio in range(anio_actual, anio_fin + 1):
            mes_inicio = mes_actual if anio == anio_actual else 1
            mes_fin = 12

            for mes in range(mes_inicio, mes_fin + 1):
                try:
                    Cuota.objects.get(year=anio, month=mes)
                    self.stdout.write(self.style.SUCCESS(f"Cuota para {mes}/{anio} ya existe."))
                except Cuota.DoesNotExist:
                    Cuota.objects.create(
                        year=anio,
                        month=mes,
                        monto_dos_dias=0,
                        monto_tres_dias=0,
                        monto_cuatro_dias=0,
                        monto_cinco_dias=0,
                    )
                    self.stdout.write(self.style.SUCCESS(f"Cuota para {mes}/{anio} creada."))