from rest_framework import serializers
from .models import CustomUser, Post, Comment

# -----------------------------
# User serializer
# -----------------------------
class UserSerializer(serializers.ModelSerializer):
    is_admin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 'is_admin', 'is_active']
        read_only_fields = ['email', 'is_admin', 'is_active']

    def get_is_admin(self, obj):
        # A legtöbb esetben az is_superuser felel meg a blog admin jogkörének.
        return obj.is_superuser

# -----------------------------
# User Registration serializer
# -----------------------------
class RegisterSerializer(serializers.ModelSerializer):
    # A jelszó mező csak írható, nem fog visszakerülni a válaszba
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = CustomUser
        # A felhasználónév, e-mail és jelszó a minimális mezők a regisztrációhoz
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}} # Bár a CharField megadja, ez egy extra megerősítés

    # Felülírjuk a create metódust a jelszó hasheléséhez
    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'] # A create_user automatikusan hasheli a jelszót
        )
        return user

# -----------------------------
# Post serializer
# -----------------------------
class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    is_admin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'created_at', 'views', 'is_admin']

    def get_is_admin(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return request.user.is_superuser
        return False

# -----------------------------
# Comment serializer
# -----------------------------
class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    is_admin = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'content', 'user', 'post', 'created_at', 'is_admin']

    # Admin jogosultság ellenőrzése (ugyanaz, mint a PostSerializer-ben)
    def get_is_admin(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return request.user.is_superuser
        return False
