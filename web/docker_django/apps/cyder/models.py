from django.db import models
from django.contrib.auth.models import User


class Model(models.Model):
    """docstring for Model."""
    filename = models.CharField(max_length=50, null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    lon = models.FloatField(null=True, blank=True)
    breaker_name = models.CharField(max_length=50, null=True, blank=True)
    city = models.CharField(max_length=50, null=True, blank=True)
    area = models.CharField(max_length=50, null=True, blank=True)
    region = models.CharField(max_length=50, null=True, blank=True)
    zip_code = models.CharField(max_length=50, null=True, blank=True)
    version = models.CharField(max_length=50, null=True, blank=True)
    upmu_location = models.CharField(max_length=50, null=True, blank=True)


class Calibration(models.Model):
    """docstring for Calibration."""
    date = models.DateTimeField(null=True, blank=True)
    model_value = models.FloatField(null=True, blank=True)
    calibration_value = models.FloatField(null=True, blank=True)
    updated = models.BooleanField(default=False)
    calibration_algorithm = models.TextField(null=True, blank=True)

class CalibrationData(models.Model):
    """docstring for CalibrationData."""
    p_a = models.FloatField(null=True, blank=True)
    p_b = models.FloatField(null=True, blank=True)
    p_c = models.FloatField(null=True, blank=True)
    q_a = models.FloatField(null=True, blank=True)
    q_b = models.FloatField(null=True, blank=True)
    q_c = models.FloatField(null=True, blank=True)
    voltage_a = models.FloatField(null=True, blank=True)
    voltage_b = models.FloatField(null=True, blank=True)
    voltage_c = models.FloatField(null=True, blank=True)