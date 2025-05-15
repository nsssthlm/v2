from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Directory

@receiver(post_save, sender=Directory)
def ensure_directory_has_slug(sender, instance, created, **kwargs):
    """
    Säkerställ att en mapp alltid har en slug för sin webbsida.
    Anropas när en mapp sparas.
    """
    if not instance.slug:
        # Spara igen för att generera slug via save-metoden
        instance.save()