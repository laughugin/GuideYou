# Generated by Django 5.1.1 on 2024-10-15 21:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0011_remove_requestlog_file'),
    ]

    operations = [
        migrations.AlterField(
            model_name='hotel',
            name='image_url',
            field=models.CharField(blank=True, max_length=1000, null=True),
        ),
    ]