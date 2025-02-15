from django.urls import path
from . import views
urlpatterns = [
    path("alumnos/", views.CreateAlumnoView.as_view(), name="alumno-list"),
    path("alumnos/<int:pk>/", views.DeleteAlumnoView.as_view(), name="delete-alumno"),
    path("cuotas/", views.CreateCuotaView.as_view(), name="cuota-list"),
    path("cuotas/delete/<int:pk>/", views.DeleteCuotaView.as_view(), name="delete-cuota"),
    path("cuotasalumno/", views.CreateCuotaAlumnoView.as_view(), name="cuota-alumno-list"),
    path("cuotasalumno/delete/<int:pk>/", views.DeleteCuotaAlumnoView.as_view(), name="delete-cuota-alumno"),
]