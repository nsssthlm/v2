# Generated manually for ValvX project

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('workspace', '0003_auto_20250514_0852'),
    ]

    operations = [
        migrations.AddField(
            model_name='pdfdocument',
            name='content_type',
            field=models.CharField(default='application/pdf', max_length=100),
        ),
    ]