from rest_framework import viewsets, permissions, generics  
from .models import Post, Comment, CustomUser
from .serializers import PostSerializer, CommentSerializer, RegisterSerializer, UserSerializer
from rest_framework.response import Response

# Csak a poszt tulajdonosa vagy admin tudja szerkeszteni / törölni
class IsOwnerOrAdmin(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # GET, HEAD, OPTIONS (SAFE_METHODS) mindig engedélyezett
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # PUT, PATCH, DELETE esetén:
        # Engedélyezve, ha a felhasználó a tárgy (obj) tulajdonosa VAGY a felhasználó staff/admin
        return obj.user == request.user or request.user.is_staff

class PostViewSet(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context.update({"request": self.request})
        return context

    def perform_create(self, serializer):
        # Most már a bejelentkezett user lesz a tulajdonos
        serializer.save(user=self.request.user)

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    # A serializer a RegisterSerializer, ami a create_user-t hívja
    serializer_class = RegisterSerializer
    # Mindenki regisztrálhat, még ha nincs is bejelentkezve
    permission_classes = [permissions.AllowAny]

class CommentViewSet(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    # A komment létrehozásához (POST) be kell jelentkezni, olvasni (GET) bárki tud.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrAdmin] 

    def perform_create(self, serializer):
        """
        Létrehozáskor automatikusan hozzárendeli a bejelentkezett felhasználót (request.user) a kommenthez.
        """
        serializer.save(user=self.request.user)

# Végpont az aktuális felhasználói adatok lekéréséhez
class CurrentUserView(generics.RetrieveAPIView):
    # A serializer, amit a válasz formázásához használunk
    serializer_class = UserSerializer 
    
    # Csak bejelentkezett felhasználók érhetik el
    permission_classes = [permissions.IsAuthenticated]

    # Mivel nem egy queryset-tel dolgozunk, hanem a request.user-rel,
    # felülírjuk a get_object metódust.
    def get_object(self):
        # A bejelentkezett felhasználó objektumát adja vissza
        return self.request.user