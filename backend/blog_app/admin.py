from django.contrib import admin
from .models import CustomUser, Post, Comment
from django.contrib.auth.admin import UserAdmin

# CustomUser marad ugyanígy
admin.site.register(CustomUser, UserAdmin)

# Post admin konfiguráció
@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('title', 'content')

# Comment admin konfiguráció
@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ('id', 'post', 'user', 'created_at')
    list_filter = ('created_at', 'user')
    search_fields = ('content',)
