from django.urls import path
from . import views

urlpatterns = [
    path("users/", views.CreateUserView.as_view(), name="user-list"),

    path("alumnos/", views.AlumnoListView.as_view(), name="alumno-list"),
    path("alumnos/<int:pk>/", views.AlumnoView.as_view(), name="alumno-detail"),

    path("cuotas/", views.CuotaListView.as_view(), name="cuota-list"),
    path("cuotas/<int:pk>/", views.CuotaView.as_view(), name="cuota-detail"),
    path("cuotas/<int:cuota_id>/unpaid-students/", views.get_unpaid_students, name="unpaid-students"),

    path("cuotasalumno/", views.CuotaAlumnoListView.as_view(), name="cuotaalumno-list"),
    path("cuotasalumno/<int:pk>/", views.CuotaAlumnoView.as_view(), name="cuotaalumno-detail"),

    path("ejercicios/", views.EjercicioListView.as_view(), name="ejercicio-list"),
    path("ejercicios/<int:pk>/", views.EjercicioView.as_view(), name="ejercicio-detail"),

    path("ejercicioalumno/", views.EjercicioAlumnoListView.as_view(), name="ejercicioalumno-list"),
    path("ejercicioalumno/<int:pk>/", views.EjercicioAlumnoView.as_view(), name="ejercicioalumno-detail"),
]