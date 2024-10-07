from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from .serializers import PagesSerializer
from .models import Pages
from rest_framework.parsers import MultiPartParser, FormParser
import base64
import requests
import json
import openai
from io import BytesIO
from django.conf import settings
from .models import UserLocation, DetectedLocation, DirectionStep, Hotel
from .serializers import DetectedLocationSerializer

class PagesView(viewsets.ModelViewSet):
    serializer_class = PagesSerializer
    queryset = Pages.objects.all()

class UserLocationView(APIView):
    def post(self, request):
        user_location = request.data
        return Response({"message": "Location received"}, status=status.HTTP_200_OK)

class FileUploadView(viewsets.ViewSet):
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request):
        file = request.FILES.get('file')
        user_location_data = request.data.get('user_location')

        if not file:
            return Response({"error": "File is required."}, status=400)

        if not user_location_data:
            return Response({"error": "user_location is required."}, status=400)

        try:
            user_location = json.loads(user_location_data)
        except json.JSONDecodeError:
            return Response({"error": "Invalid JSON format for user_location."}, status=400)

        # Store user location in the database
        user_location_instance = UserLocation.objects.create(latitude=user_location['lat'], longitude=user_location['lng'])

        # Detect location from the image
        location_response = self.detect_location(file)

        if 'error' in location_response:
            return Response(location_response, status=400)

        # Store detected location in the database
        detected_location_instance = DetectedLocation.objects.create(
            location_name=location_response.get('location_name', ''),
            latitude=location_response['lat'],
            longitude=location_response['lng']
        )

        # Get directions and save each step in the database
        directions = self.get_directions(user_location, location_response)
        if 'error' not in directions:
            for step in directions:
                DirectionStep.objects.create(
                    detected_location=detected_location_instance,
                    instruction=step['html_instructions'],
                    distance=step['distance']['text'],
                    duration=step['duration']['text']
                )

        # Get nearby hotels and save each hotel in the database
        hotels = self.get_nearby_hotels(location_response)
        if 'error' not in hotels:
            guessed_coordinates = {'lat': location_response['lat'], 'lng': location_response['lng']}
            for hotel in hotels:
                hotel_coords = {'lat': hotel['lat'], 'lng': hotel['lng']}
                distance = self.calculate_distance(guessed_coordinates, hotel_coords)

                Hotel.objects.create(
                    detected_location=detected_location_instance,
                    name=hotel['name'],
                    address=hotel['address'],
                    rating=hotel.get('rating'),
                    latitude=hotel['lat'],
                    longitude=hotel['lng'],
                    image_url=hotel.get('image'),
                    distance=distance
                )

        
        detected_location_serializer = DetectedLocationSerializer(detected_location_instance)
        print(detected_location_serializer)
        return Response(detected_location_serializer.data, status=200)

    def detect_location(self, file):
        image_data = BytesIO(file.read())
        content = base64.b64encode(image_data.getvalue()).decode("utf-8")

        vision_api_key = settings.VISION_API_KEY
        maps_api_key = settings.MAPS_API_KEY
        openai_api_key = settings.OPENAI_API_KEY

        request_data = {
            "requests": [
                {
                    "image": {
                        "content": content
                    },
                    "features": [
                        {
                            "type": "LANDMARK_DETECTION"
                        }
                    ]
                }
            ]
        }

        vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={vision_api_key}"

        response = requests.post(vision_url, data=json.dumps(request_data), headers={'Content-Type': 'application/json'})

        if response.status_code == 200:
            landmark_annotations = response.json().get('responses', [])[0].get('landmarkAnnotations', [])
            if landmark_annotations:
                landmark = landmark_annotations[0]
                location_name = landmark['description']
                lat = landmark['locations'][0]['latLng']['latitude']
                lng = landmark['locations'][0]['latLng']['longitude']
                return {'location_name': location_name, 'lat': lat, 'lng': lng}
            else:
                return self.detect_web_entities(content, openai_api_key, maps_api_key)
        else:
            return {'error': f"Vision API Error: {response.status_code}"}

    def detect_web_entities(self, content, openai_api_key, maps_api_key):
        request_data = {
            "requests": [
                {
                    "image": {
                        "content": content
                    },
                    "features": [
                        {
                            "type": "WEB_DETECTION"
                        }
                    ]
                }
            ]
        }

        vision_api_key = settings.VISION_API_KEY
        vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={vision_api_key}"

        response = requests.post(vision_url, data=json.dumps(request_data), headers={'Content-Type': 'application/json'})

        if response.status_code == 200:
            web_detection = response.json().get('responses', [])[0].get('webDetection', {})
            if web_detection and 'webEntities' in web_detection:
                descriptions = []
                for entity in web_detection.get('webEntities', []):
                    description = entity.get('description')
                    score = entity.get('score')
                    descriptions.append(f"Description: {description}, Score: {score}")

                print(descriptions)
                location_name = self.get_location_from_chatgpt(descriptions, openai_api_key)
                if location_name:
                    coordinates = self.get_coordinates(location_name, maps_api_key)
                    if 'lat' in coordinates and 'lng' in coordinates:
                        return {'location_name': location_name, 'lat': coordinates['lat'], 'lng': coordinates['lng']}
                    else:
                        return {'error': f"No coordinates found for {location_name}."}
                else:
                    return {'error': "No significant location found from web entities."}
            else:
                return {'error': "No web entities detected."}
        else:
            return {'error': f"Web Detection API Error: {response.status_code}"}

    def get_location_from_chatgpt(self, descriptions, openai_api_key):
        openai.api_key = openai_api_key
        prompt = "Based on the following descriptions and their scores, identify the most probable location in a form of 'location, City(where location is)' in answer don't include any other + words that are not connected to location thatwords :\n\n"
        prompt += "\n".join(descriptions)

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "system", "content": "You are an assistant that identifies locations."},
                          {"role": "user", "content": prompt}],
                max_tokens=60,
                n=1,
                stop=None,
                temperature=0.5
            )
            location_name = response['choices'][0]['message']['content'].strip()
            print("Location identified:", location_name)
            return location_name
        except Exception as e:
            print("Error in ChatGPT API:", e)
            return None

    def get_coordinates(self, location_name, maps_api_key):
        geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(location_name)}&key={maps_api_key}"
        response = requests.get(geocode_url)

        if response.status_code == 200:
            geocode_data = response.json()
            results = geocode_data.get('results', [])
            if results:
                location = results[0].get('geometry', {}).get('location', {})
                return {'lat': location.get('lat'), 'lng': location.get('lng')}
            else:
                return {'error': f"No coordinates found for {location_name}."}
        else:
            return {'error': f"Geocoding API Error: {response.status_code}"}

    def get_directions(self, user_location, destination_coordinates):
        directions_api_key = settings.DIRECTIONS_API_KEY  
        directions_url = (
            f"https://maps.googleapis.com/maps/api/directions/json?"
            f"origin={user_location['lat']},{user_location['lng']}&"
            f"destination={destination_coordinates['lat']},{destination_coordinates['lng']}&"
            f"key={directions_api_key}"
        )
        response = requests.get(directions_url)
        print(response)
        if response.status_code == 200:
            directions_data = response.json()
            if directions_data['status'] == 'OK':
                return directions_data['routes'][0]['legs'][0]['steps']  
            else:
                return {'error': directions_data['status']}
        else:
            return {'error': f"Directions API Error: {response.status_code}"}

    def get_nearby_hotels(self, coordinates):
        places_api_key = settings.PLACES_API_KEY  
        places_url = (
            f"https://maps.googleapis.com/maps/api/place/nearbysearch/json?"
            f"location={coordinates['lat']},{coordinates['lng']}&"
            f"radius=5000&type=lodging&key={places_api_key}"
        )

        response = requests.get(places_url)

        if response.status_code == 200:
            places_data = response.json()
            if places_data['status'] == 'OK':
                hotels = []
                for place in places_data.get('results', []):
                    hotel_data = {
                        'name': place['name'],
                        'address': place['vicinity'],
                        'rating': place.get('rating'),
                        'lat': place['geometry']['location']['lat'],
                        'lng': place['geometry']['location']['lng'],
                    }
                    
                    # Get the first photo reference if available
                    photos = place.get('photos', [])
                    if photos:
                        hotel_data['image'] = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={photos[0]['photo_reference']}&key={places_api_key}"

                    hotels.append(hotel_data)
                return hotels
            else:
                return {'error': places_data['status']}
        else:
            return {'error': f"Places API Error: {response.status_code}"}

    def calculate_distance(self, point1, point2):
        from math import radians, sin, cos, sqrt, atan2
        
        R = 6371  # Radius of the Earth in kilometers
        lat1, lon1 = radians(point1['lat']), radians(point1['lng'])
        lat2, lon2 = radians(point2['lat']), radians(point2['lng'])
        
        dlat = lat2 - lat1
        dlon = lon2 - lon1
        
        a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
        c = 2 * atan2(sqrt(a), sqrt(1 - a))
        
        distance = R * c  
        return round(distance, 2)  