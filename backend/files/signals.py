from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Directory, File

@receiver(post_save, sender=Directory)
def ensure_directory_has_slug(sender, instance, created, **kwargs):
    """
    Säkerställ att en mapp alltid har en slug för sin webbsida.
    Anropas när en mapp sparas.
    """
    if not instance.slug:
        # Spara igen för att generera slug via save-metoden
        instance.save()

@receiver(post_save, sender=Directory)
def handle_subdirectory_file_transfer(sender, instance, created, **kwargs):
    """
    När en undermapp skapas direkt under en mapp som innehåller filer,
    flytta alla filer från föräldramappen till den nya undermappen.
    
    Detta sker endast för första nivåns undermapp (direkt under föräldramappen).
    Om undermappen skapas under en undermapp sker ingen filöverföring.
    """
    if created and instance.parent:
        parent = instance.parent
        
        # Kontrollera om föräldermappen har några subdirectories förutom denna nya
        existing_subdirs = Directory.objects.filter(parent=parent).exclude(id=instance.id).count()
        
        # Om det inte finns andra undermappar (detta är den första undermappen)
        # och föräldermappen har filer, flytta filerna till den nya undermappen
        if existing_subdirs == 0:
            # Hämta alla filer från föräldermappen
            parent_files = File.objects.filter(directory=parent)
            
            if parent_files.exists():
                # Flytta filerna till den nya undermappen
                for file in parent_files:
                    # Spara gamla värden för loggning
                    old_directory_id = file.directory.id if file.directory else None
                    
                    # Uppdatera fil-mappen till den nya undermappen
                    file.directory = instance
                    file.save()
                    
                    print(f"Flyttade fil '{file.name}' från mapp {old_directory_id} till undermapp {instance.id}")