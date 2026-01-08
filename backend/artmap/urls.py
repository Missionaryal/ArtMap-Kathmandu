from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),   # admin URLs 
    path('api/', include('apps.urls')), # app URLs
]
