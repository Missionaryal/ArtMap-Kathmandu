from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Place
from .serializers import PlaceSerializer

@api_view(['GET'])
def place_list(request):
    places = Place.objects.all()  # Get all places from the database
    serializer = PlaceSerializer(places, many=True)
    return Response(serializer.data)

