from rest_framework import serializers
from .models import UserLocation, DetectedLocation, DirectionStep, Hotel, Pages

class PagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pages 
        fields = '__all__'

class UserLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserLocation
        fields = '__all__'

class DirectionStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = DirectionStep
        fields = '__all__'

class HotelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hotel
        fields = '__all__'

class DetectedLocationSerializer(serializers.ModelSerializer):
    directions = DirectionStepSerializer(many=True, read_only=True)
    hotels = HotelSerializer(many=True, read_only=True)

    class Meta:
        model = DetectedLocation
        fields = ['location_name', 'latitude', 'longitude', 'directions', 'hotels']
