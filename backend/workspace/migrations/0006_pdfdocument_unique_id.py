# Generated manually for ValvX project

from django.db import migrations, models
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0005_pdfdocument_size'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfdocument',
            name='unique_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]