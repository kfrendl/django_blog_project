from rest_framework import viewsets, permissions, generics, status
from .models import Post, Comment, CustomUser, Like
from .serializers import PostSerializer, CommentSerializer, RegisterSerializer, UserSerializer, LikeSerializer
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
    
class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    # Csak létrehozást (kedvelés) és törlést (kedvelés visszavonása) engedélyezünk
    http_method_names = ['get', 'post', 'delete']

    # Létrehozás (Kedvelés)
    def perform_create(self, serializer):
        # Automatikusan hozzárendeli a bejelentkezett felhasználót a Like objektumhoz
        serializer.save(user=self.request.user)

    # Törlés (Kedvelés visszavonása/Unlike)
    def destroy(self, request, *args, **kwargs):
        # A kwargs['pk'] a Like ID-ja
        instance = self.get_object() 
        
        # Biztosítjuk, hogy csak a saját kedvelését vonhassa vissza
        if instance.user != request.user:
            return Response(
                {"detail": "Nincs jogosultságod más kedvelésének visszavonásához."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        self.perform_destroy(instance)
        
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def get_queryset(self):
        queryset = Like.objects.all()
        request = self.request
        
        # Ha a felhasználó be van jelentkezve, alapértelmezetten szűrjük a saját like-jaira.
        # Ez a LIST műveletre vonatkozik (/api/likes/?...)
        if request.user.is_authenticated:
            queryset = queryset.filter(user=request.user)
            
        # Ez a feltételmarad, ha poszt ID-re is szűrni akarunk
        post_id = request.query_params.get('post')
        if post_id:
            queryset = queryset.filter(post_id=post_id)
            
        # Ha a frontend USER ID-t küld, felülírhatja (ez nem javasolt, de hagyjuk)
        # user_id = request.query_params.get('user') 
        # if user_id:
        #     queryset = queryset.filter(user_id=user_id) 
            
        return queryset