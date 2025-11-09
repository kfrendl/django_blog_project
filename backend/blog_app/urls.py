from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostViewSet, CommentViewSet, RegisterView, CurrentUserView

# Router létrehozása
router = DefaultRouter()
router.register(r'posts', PostViewSet, basename='post')
router.register(r'comments', CommentViewSet, basename='comment')

# URL-ek
urlpatterns = [
    path('', include(router.urls)), # ez teszi lehetove a router tartalmat

    # Regisztracios vegpont
    path('register/', RegisterView.as_view(), name='auth_register'),

    # A felhasználói profil végpont regisztrálása
    path('user/me/', CurrentUserView.as_view(), name='current_user_profile'),
]
