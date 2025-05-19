from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import custom_views
from . import csrf_views

router = DefaultRouter()
router.register('users', views.UserViewSet)
router.register('projects', views.ProjectViewSet)
router.register('tasks', views.TaskViewSet)
router.register('roles', views.RoleAccessViewSet)
router.register('time-reports', views.TimeReportViewSet)
router.register('project-sample', views.ProjectSampleViewSet, basename='project-sample')

urlpatterns = [
    # Main API endpoints
    path('', include(router.urls)),

    # CSRF token endpoint for secure file uploads
    path('csrf/', csrf_views.get_csrf_token, name='csrf'),

    # Anpassade vyer för att hantera projekt utan autentisering (för utveckling)
    path('custom/create-project', custom_views.create_project, name='create-project'),
    path('custom/projects', custom_views.get_all_projects, name='get-all-projects'),
]
