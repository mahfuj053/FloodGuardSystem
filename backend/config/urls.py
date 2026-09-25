from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/', include('alerts.urls')),
    path('api/', include('requests_help.urls')),
    path('api/', include('relief.urls')),
    path('api/', include('funds.urls')),
    path('api/', include('dashboard.urls')),
        path('api/', include('community.urls')),
]
