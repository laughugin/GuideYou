from django.db import models

class Pages(models.Model):
    title = models.CharField(max_length=1000)
    content = models.CharField(max_length=1000)

    def __str__(self):
        return self.title
class UserLocation(models.Model):
    latitude = models.FloatField()
    longitude = models.FloatField()

class DetectedLocation(models.Model):
    location_name = models.CharField(max_length=1000)
    latitude = models.FloatField()
    longitude = models.FloatField()

class DirectionStep(models.Model):
    detected_location = models.ForeignKey(DetectedLocation, on_delete=models.CASCADE, related_name='directions')
    instruction = models.CharField(max_length=1000)
    distance = models.CharField(max_length=1000)
    duration = models.CharField(max_length=1000)

class Hotel(models.Model):
    detected_location = models.ForeignKey(DetectedLocation, on_delete=models.CASCADE, related_name='hotels')
    name = models.CharField(max_length=1000)
    address = models.CharField(max_length=1000)
    rating = models.FloatField(null=True, blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    image_url = models.CharField(max_length=1500, null=False)
    distance = models.FloatField()  
