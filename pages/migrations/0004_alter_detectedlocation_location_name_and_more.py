# Generated by Django 5.1.1 on 2024-10-03 18:52

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0003_detectedlocation_userlocation_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='detectedlocation',
            name='location_name',
            field=models.CharField(max_length=1000),
        ),
        migrations.AlterField(
            model_name='directionstep',
            name='distance',
            field=models.CharField(max_length=1000),
        ),
        migrations.AlterField(
            model_name='directionstep',
            name='duration',
            field=models.CharField(max_length=1000),
        ),
        migrations.AlterField(
            model_name='hotel',
            name='name',
            field=models.CharField(max_length=1000),
        ),
        migrations.AlterField(
            model_name='pages',
            name='title',
            field=models.CharField(max_length=1000),
        ),
    ]
