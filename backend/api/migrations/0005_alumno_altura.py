# Generated by Django 5.1.5 on 2025-02-12 19:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_alumno_fecha_nacimiento_alumno_peso'),
    ]

    operations = [
        migrations.AddField(
            model_name='alumno',
            name='altura',
            field=models.IntegerField(default=0),
        ),
    ]
