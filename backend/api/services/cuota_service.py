from datetime import date, timedelta
from api.models import Alumno, Cuota, CuotaAlumno

# Esto no va a andar bien xd
def generar_cuotas_mensuales():

    hoy = date.today()
    alumnos_activos = Alumno.objects.filter(activo=True)

    for alumno in alumnos_activos:

        ultima_cuota = CuotaAlumno.objects.filter(alumno=alumno).order_by('-fecha_vencimiento').first()

        if ultima_cuota:
            # Si existe una cuota previa, verifica si ya pasó el vencimiento
            if ultima_cuota.fecha_vencimiento and hoy >= ultima_cuota.fecha_vencimiento: #Vencido
                nueva_fecha_vencimiento = ultima_cuota.fecha_vencimiento + timedelta(days=30)
            else:
                # No es necesario generar una nueva cuota si no está vencida
                continue
        else:
            # Primera cuota del alumno
            nueva_fecha_vencimiento = hoy + timedelta(days=30)

        # Crear o asociar la cuota del mes
        cuota, created = Cuota.objects.get_or_create(
            mes=nueva_fecha_vencimiento.month,
            year=nueva_fecha_vencimiento.year,
            defaults={
                "monto_dos_dias": 2000,
                "monto_tres_dias": 2500,
                "monto_cuatro_dias": 3000,
                "monto_cinco_dias": 3500,
            }
        )

        # Crear la relación CuotaAlumno
        CuotaAlumno.objects.create(
            alumno=alumno,
            cuota=cuota,
            pagada=False,
            dias_por_semana=3,  # Configuración por defecto o personalizada
            descuento=0,
            fecha_vencimiento=nueva_fecha_vencimiento
        )


    # for alumno in alumnos_activos:
    #     # Verificar si ya existe una cuota para el próximo mes
    #     ultima_cuota = CuotaAlumno.objects.filter(alumno=alumno).order_by('-cuota__year', '-cuota__mes').first()
    #     if ultima_cuota:
    #         # Generar cuota solo si la última cuota fue pagada hace más de un mes
    #         fecha_proxima_cuota = ultima_cuota.fecha_pago + timedelta(days=30)
    #         if fecha_proxima_cuota > hoy:
    #             continue

    #     # Crear la nueva cuota
    #     mes = hoy.month + 1 if hoy.month < 12 else 1
    #     year = hoy.year if hoy.month < 12 else hoy.year + 1
    #     cuota = Cuota.objects.get_or_create(mes=mes, year=year)[0]
    #     CuotaAlumno.objects.create(
    #         alumno=alumno,
    #         cuota=cuota,
    #         pagada=False,
    #         descuento=0
    #     )