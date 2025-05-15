from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Directory, File

@receiver(post_save, sender=Directory)
def ensure_directory_has_slug(sender, instance, created, **kwargs):
    """
    När en ny mapp skapas, se till att den har en slug och en sida (om has_page=True)
    """
    # Om mappens has_page=True men saknar page_title, sätt titeln till mappnamnet
    if instance.has_page and not instance.page_title:
        instance.page_title = instance.name
        instance.save(update_fields=['page_title'])