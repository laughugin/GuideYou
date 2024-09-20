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

class PagesView(viewsets.ModelViewSet):
    serializer_class = PagesSerializer
    queryset = Pages.objects.all()

class UserLocationView(APIView):
    def post(self, request):
        user_location = request.data
        print("User Location Received:", user_location)
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

        location_response = self.detect_location(file)
        print("Location Detection Response:", location_response)

        if 'error' in location_response:
            return Response(location_response, status=400)

        # Get directions and nearby hotels
        directions = self.get_directions(user_location, location_response)
        print("Directions Response:", directions)  # Debugging

        hotels = self.get_nearby_hotels(location_response)
        print("Hotels Response:", hotels)  # Debugging

        return Response({
            "location": location_response,
            "generated_location_name": location_response,  
            "directions": directions,
            "hotels": hotels
        }, status=200)

    def detect_location(self, file):
        image_data = BytesIO(file.read())
        content = base64.b64encode(image_data.getvalue()).decode("utf-8")

        vision_api_key = settings.VISION_API_KEY
        maps_api_key = settings.MAPS_API_KEY
        openai_api_key = settings.OPENAI_API_KEY
        print(vision_api_key + '\n' + maps_api_key + '\n' + openai_api_key)


        # Create the request payload for Google Vision API
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

        vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={vision_api_key}"

        response = requests.post(vision_url, data=json.dumps(request_data), headers={'Content-Type': 'application/json'})
        
        if response.status_code == 200:
            web_detection = response.json().get('responses', [])[0].get('webDetection', {})
            if web_detection:
                descriptions = []
                for entity in web_detection.get('webEntities', []):
                    description = entity.get('description')
                    score = entity.get('score')
                    descriptions.append(f"Description: {description}, Score: {score}")

                location_name = self.get_location_from_chatgpt(descriptions, openai_api_key)
                
                if location_name:
                    return self.get_coordinates(location_name, maps_api_key)
                else:
                    return {'error': "No significant location found."}
            else:
                return {'error': "No web entities detected."}
        else:
            return {'error': f"Vision API Error: {response.status_code}"}

    def get_location_from_chatgpt(self, descriptions, openai_api_key):
        openai.api_key = openai_api_key
        prompt = "Based on the following descriptions and their scores, identify the most probable location:\n\n"
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
            print("Error calling OpenAI API:", e)
            return None

    def get_coordinates(self, location_name, maps_api_key):
        geocode_url = f"https://maps.googleapis.com/maps/api/geocode/json?address={requests.utils.quote(location_name)}&key={maps_api_key}"
        response = requests.get(geocode_url)

        if response.status_code == 200:
            geocode_data = response.json()
            results = geocode_data.get('results', [])
            if results:
                location = results[0].get('geometry', {}).get('location', {})
                print("Coordinates found:", location)
                return {'lat': location.get('lat'), 'lng': location.get('lng')}
            else:
                return {'error': f"No coordinates found for {location_name}."}
        else:
            return {'error': f"Geocoding API Error: {response.status_code}"}

    def get_directions(self, user_location, destination_coordinates):
        print('Getting directions...')  
        directions_api_key = settings.DIRECTIONS_API_KEY  
        directions_url = (
            f"https://maps.googleapis.com/maps/api/directions/json?"
            f"origin={user_location['lat']},{user_location['lng']}&"
            f"destination={destination_coordinates['lat']},{destination_coordinates['lng']}&"
            f"key={directions_api_key}"
        )
        response = requests.get(directions_url)
        print("Directions API Response:", response.json())  
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
        print('Getting nearby hotels...')  
    
        response = requests.get(places_url)
        print("Places API Response:", response.json())  
    
        if response.status_code == 200:
            places_data = response.json()
            if places_data['status'] == 'OK':
                hotels = []
                for place in places_data.get('results', []):
                    hotels.append({
                        'name': place['name'],
                        'address': place['vicinity'],
                        'rating': place.get('rating'),
                        'price_level': place.get('price_level')  
                    })
                # Limit hotels to 6
                return hotels[:6]
            else:
                return {'error': places_data['status']}
        else:
            return {'error': f"Places API Error: {response.status_code}"}
