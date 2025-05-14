# Generated manually for ValvX project

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0004_pdfdocument_content_type'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfdocument',
            name='size',
            field=models.BigIntegerField(default=0),
            preserve_default=False,
        ),
    ]