# Generated by Django 5.0.5 on 2024-05-06 22:24

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='pages',
            name='completed',
            field=models.BooleanField(default=False),
        ),
    ]