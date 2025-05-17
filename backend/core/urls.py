from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import custom_views

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

    # Anpassad vy för att skapa projekt utan autentisering (för utveckling)
    path('custom/create-project', custom_views.create_project, name='create-project'),
]
