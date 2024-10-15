from django.db import models

class RequestLog(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    user_ip = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.CharField(max_length=500, null=True, blank=True)
    user_sub = models.CharField(max_length=500, null=True, blank=True)

    def __str__(self):
        return f"Request at {self.timestamp}"

class Pages(models.Model):
    title = models.CharField(max_length=1000)
    content = models.CharField(max_length=1000)

    def __str__(self):
        return self.title

class UserLocation(models.Model):
    request_log = models.ForeignKey(RequestLog, on_delete=models.CASCADE, related_name="user_locations")
    lat = models.FloatField()
    lng = models.FloatField()
    

    def __str__(self):
        return f"UserLocation(lat={self.lat}, lng={self.lng})"

class DetectedLocation(models.Model):
    request_log = models.ForeignKey(RequestLog, on_delete=models.CASCADE, related_name="detected_locations", default=1)
    location_name = models.CharField(max_length=1000)
    lat = models.FloatField()
    lng = models.FloatField()

    def __str__(self):
        return f"DetectedLocation(name={self.location_name}, lat={self.lat}, lng={self.lng})"

class DirectionStep(models.Model):
    detected_location = models.ForeignKey(DetectedLocation, on_delete=models.CASCADE, related_name='directions')
    instruction = models.CharField(max_length=1000)
    distance = models.CharField(max_length=1000)
    duration = models.CharField(max_length=1000)

    def __str__(self):
        return f"DirectionStep(instruction={self.instruction}, distance={self.distance}, duration={self.duration})"

class Hotel(models.Model):
    request_log = models.ForeignKey(RequestLog, on_delete=models.CASCADE)
    detected_location = models.ForeignKey(DetectedLocation, on_delete=models.CASCADE, related_name='hotels')
    name = models.CharField(max_length=1000)
    address = models.CharField(max_length=1000)
    rating = models.FloatField(null=True, blank=True)  
    lat = models.FloatField()
    lng = models.FloatField()
    image_url = models.CharField(max_length=1000) 

    distance = models.FloatField()

    def __str__(self):
        return f"Hotel(name={self.name}, address={self.address}, rating={self.rating}, image_url={self.image_url}, lat={self.lat}, lng={self.lng})"
