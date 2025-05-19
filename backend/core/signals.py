from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Project
from files.models import Directory
import logging

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Project)
def prevent_default_directory_creation(sender, instance, created, **kwargs):
    """
    Förhindrar att standardmappar skapas automatiskt för nya projekt.
    Denna signal körs efter att ett projekt har skapats eller uppdaterats.
    Den letar efter nyligen skapade standardmappar och tar bort dem.
    """
    if created:
        # När ett nytt projekt skapas, leta efter nyligen skapade standardmappar och ta bort dem
        logger.info(f"Nytt projekt skapat: {instance.name} (ID: {instance.id})")
        logger.info("Förhindrar skapande av standardmappar enligt användarens önskemål")
        
        # Leta efter mappar som kan ha skapats automatiskt för detta projekt
        default_directories = Directory.objects.filter(
            project=instance,
            name__in=["Dokument", "Documents", "Filer", "Files"]  # Vanliga standardmappnamn
        )
        
        # Ta bort dem om de finns
        if default_directories.exists():
            count = default_directories.count()
            default_directories.delete()
            logger.info(f"Tog bort {count} automatiskt skapade standardmappar för projekt {instance.name}")