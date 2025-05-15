# Generated manually for ValvX project

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0006_pdfdocument_unique_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfdocument',
            name='version',
            field=models.PositiveIntegerField(default=1),
        ),
    ]