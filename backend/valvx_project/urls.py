"""
URL configuration for valvx_project project.
"""
from django.contrib import admin
from django.urls import path, include
from api.pdf import register_pdf_api_routes
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from core import custom_views

urlpatterns = [
    path('admin/', admin.site.urls),
    # API endpoints
    path('api/', include([
        # JWT Authentication
        path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
        path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
        
        # Status endpoint
        path('status/', lambda request: HttpResponse(b'{"status": "ok"}', content_type='application/json')),
        
        # Custom endpoints för projekthantering
        path('custom/create-project', custom_views.create_project, name='create-project'),
        
        # App routes
        path('', include('core.urls')),
        path('files/', include('files.urls')),
        path('wiki/', include('wiki.urls')),
        path('notifications/', include('notifications.urls')),
        path('workspace/', include('workspace.urls')),
    ])),
]

# Registrera PDF API routes
register_pdf_api_routes(urlpatterns)

# Add static and media URLs - i utvecklingsläge tillåter vi direkt åtkomst till alla filer
# Detta är nödvändigt för att PDF-filer ska kunna visas direkt från servern
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
