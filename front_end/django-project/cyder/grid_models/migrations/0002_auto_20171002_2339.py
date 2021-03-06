# -*- coding: utf-8 -*-
# Generated by Django 1.11.5 on 2017-10-02 23:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('grid_models', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='model',
            name='latitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='model',
            name='longitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='node',
            name='VA',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='node',
            name='VB',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='node',
            name='VC',
            field=models.FloatField(blank=True, null=True),
        ),
    ]
