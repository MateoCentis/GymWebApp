from django.contrib import admin
from django.urls import path, include
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    #Cuando vayamos a la ruta escrita, llamamos a la view creada
    path("api/user/register/", CreateUserView.as_view(), name="register"),
    #Para el token
    path("api/token/", TokenObtainPairView.as_view(), name="get_token"),
    #Para refrescar el token
    path("api/token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("api-auth/", include("rest_framework.urls")),
    path("api/", include("api.urls")),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
