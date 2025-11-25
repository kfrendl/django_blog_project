from rest_framework import serializers
from .models import CustomUser, Post, Comment, Like

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
    # A kedvelések száma
    likes_count = serializers.SerializerMethodField()
    # Megmutatja, hogy a bejelentkezett felhasználó kedvelte-e a posztot
    is_liked = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        # Hozzáadva likes_count és is_liked
        fields = ['id', 'title', 'content', 'user', 'created_at', 'likes_count', 'is_liked']
        read_only_fields = ['user']

    # Metódus a kedvelések számának meghatározására
    def get_likes_count(self, obj):
        return obj.like_set.count()

    # Metódus annak ellenőrzésére, hogy a felhasználó kedvelte-e a posztot
    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            # Megnézi, létezik-e Like rekord a poszt és az aktuális felhasználó között
            return obj.like_set.filter(user=request.user).exists()
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

    # Admin jogosultság ellenőrzése
    def get_is_admin(self, obj):
        request = self.context.get('request', None)
        if request and request.user.is_authenticated:
            return request.user.is_superuser
        return False

class LikeSerializer(serializers.ModelSerializer):
    # Csak a poszt ID-jét várjuk a frontendről
    post = serializers.PrimaryKeyRelatedField(queryset=Post.objects.all())
    # A user mező csak olvasható, a backend állítja be
    user = UserSerializer(read_only=True) 

    class Meta:
        model = Like
        fields = ['id', 'post', 'user', 'created_at']
        # Mivel a felhasználót a nézet állítja be (ne lehessen manipulálni)
        read_only_fields = ['user'] 
        
    # Validálás a UniqueTogether megszorításra (dupla like ellen)
    def validate(self, data):
        request = self.context.get('request')
        post = data['post']
        
        # Ez a feltétel a create műveletre vonatkozik
        if request.user.like_set.filter(post=post).exists():
            raise serializers.ValidationError("Ezt a posztot már kedvelted.")
            
        return data