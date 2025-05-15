import os
import django

# Konfigurera Django-inställningar
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'valvx_project.settings')
django.setup()

# Importera User-modellen
from core.models import User

# Skapa en admin-användare
user = User.objects.create_superuser(
    username='admin',
    email='admin@valvx.com',
    password='Admin123!',
    first_name='Admin',
    last_name='User'
)

print(f"Användare '{user.username}' skapad med email '{user.email}'")