from django.shortcuts import render
from rest_framework import viewsets, permissions
from .models import Post, Comment
from .serializers import PostSerializer, CommentSerializer

# Create your views here.

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.AllowAny]  # <--- bárki küldhet kérést (fejlesztéshez)

    def perform_create(self, serializer):
        # Ideiglenesen hozzárendelünk egy usert, pl. az első usert az adatbázisból
        from .models import CustomUser
        user = CustomUser.objects.first()  # csak teszteléshez
        serializer.save(user=user)


class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes = [permissions.AllowAny]  # <--- ide is
