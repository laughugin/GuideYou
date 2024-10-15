from rest_framework import serializers
from .models import UserLocation, DetectedLocation, DirectionStep, Hotel, Pages, RequestLog

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
        fields = ['location_name', 'lat', 'lng', 'directions', 'hotels']

class PagesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pages 
        fields = '__all__'

class SearchHistorySerializer(serializers.ModelSerializer):
    user_locations = UserLocationSerializer(many=True, read_only=True)
    detected_locations = DetectedLocationSerializer(many=True, read_only=True)

    class Meta:
        model = RequestLog
        fields = ['timestamp', 'user_ip', 'user_agent', 'user_sub', 'user_locations', 'detected_locations']  # Added fields
