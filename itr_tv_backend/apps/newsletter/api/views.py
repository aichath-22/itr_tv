from rest_framework import generics, permissions
from ..models import Subscriber
from .serializers import SubscriberSerializer


class SubscribeView(generics.CreateAPIView):
    queryset = Subscriber.objects.all()
    serializer_class = SubscriberSerializer
    permission_classes = [permissions.AllowAny]
