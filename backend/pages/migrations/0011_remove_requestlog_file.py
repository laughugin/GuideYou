# Generated by Django 5.1.1 on 2024-10-15 19:17

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('pages', '0010_alter_requestlog_file'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='requestlog',
            name='file',
        ),
    ]
