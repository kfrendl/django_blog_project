from rest_framework import serializers
from .models import CustomUser, Post, Comment

# -----------------------------
# User serializer
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 'is_admin', 'is_active']

# -----------------------------
# Post serializer
# -----------------------------
class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)  # a poszt szerzőjét is visszaadja

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'created_at', 'views']

# -----------------------------
# Comment serializer
# -----------------------------
class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())

    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'post', 'created_at']
