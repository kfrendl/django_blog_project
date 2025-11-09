from django.db import models
from django.contrib.auth.models import AbstractUser

# -----------------------------
# Custom User modell
# -----------------------------
class CustomUser(AbstractUser):
    # username, password, email, last_login már része az AbstractUser-nek
    date_of_registration = models.DateField(auto_now_add=True)
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    bio = models.CharField(max_length=200, blank=True)

    def __str__(self):
        return self.username

# -----------------------------
# Post modell
# -----------------------------
class Post(models.Model):
    title = models.CharField(max_length=50)
    content = models.TextField()
    # A felhasználóra való hivatkozáshoz (ha ugyanabban az appban van) használhatod az osztálynevet
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='posts') 
    created_at = models.DateTimeField(auto_now_add=True)
    views = models.IntegerField(default=0)

    def __str__(self):
        return self.title

# -----------------------------
# Comment modell
# -----------------------------
class Comment(models.Model):
    content = models.CharField(max_length=200)
    # Hivatkozás a CustomUser-re
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Comment by {self.user.username} on {self.post.title}'


# -----------------------------
# Like modell
# -----------------------------
class Like(models.Model):
    # VÁLTOZÁS: Hivatkozzunk a CustomUser-re közvetlenül az osztálynévvel, 
    # mivel ugyanabban a models.py fájlban van definiálva.
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE) 
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.user.username} likes {self.post.title[:20]}'