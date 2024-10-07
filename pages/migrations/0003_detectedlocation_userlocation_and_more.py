# Generated by Django 5.1.1 on 2024-10-03 18:49

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0002_pages_completed'),
    ]

    operations = [
        migrations.CreateModel(
            name='DetectedLocation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('location_name', models.CharField(max_length=255)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
            ],
        ),
        migrations.CreateModel(
            name='UserLocation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
            ],
        ),
        migrations.RenameField(
            model_name='pages',
            old_name='description',
            new_name='content',
        ),
        migrations.RemoveField(
            model_name='pages',
            name='completed',
        ),
        migrations.AlterField(
            model_name='pages',
            name='title',
            field=models.CharField(max_length=255),
        ),
        migrations.CreateModel(
            name='DirectionStep',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('instruction', models.TextField()),
                ('distance', models.CharField(max_length=255)),
                ('duration', models.CharField(max_length=255)),
                ('detected_location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='directions', to='pages.detectedlocation')),
            ],
        ),
        migrations.CreateModel(
            name='Hotel',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255)),
                ('address', models.TextField()),
                ('rating', models.FloatField(blank=True, null=True)),
                ('latitude', models.FloatField()),
                ('longitude', models.FloatField()),
                ('image_url', models.URLField(blank=True, null=True)),
                ('distance', models.FloatField()),
                ('detected_location', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='hotels', to='pages.detectedlocation')),
            ],
        ),
    ]
