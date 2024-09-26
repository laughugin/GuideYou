# pages/models.py
from django.db import models

class Pages(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    description = models.TextField()  # Add this line
    completed = models.BooleanField(default=False)  # Add this line

    def __str__(self):
        return self.title

