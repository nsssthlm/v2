from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

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
    
    # Authentication endpoints
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('me/', views.UserMeView.as_view(), name='me'),
    
    # JWT Token endpoints
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
