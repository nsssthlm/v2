from django.apps import AppConfig


class FilesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'files'
    
    def ready(self):
        """Importera signaler när appen startas"""
        import files.signals
