from django.contrib import admin
from django.utils.html import format_html
from .models import UserProfile, CreatorProfile, Place, PlacePhoto, Post, Review, Bookmark


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'is_creator', 'created_at']
    list_filter = ['is_creator', 'created_at']
    search_fields = ['user__username', 'user__email', 'bio']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'bio', 'is_creator')
        }),
        ('Profile Picture', {
            'fields': ('profile_picture',)
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(CreatorProfile)
class CreatorProfileAdmin(admin.ModelAdmin):
    list_display = ['business_name', 'user_profile', 'category', 'verified', 'status', 'created_at']
    list_filter = ['category', 'verified', 'status', 'created_at']
    search_fields = ['business_name', 'business_description', 'user_profile__user__username']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Business Information', {
            'fields': ('user_profile', 'business_name', 'business_description', 'category')
        }),
        ('Verification Status', {
            'fields': ('verified', 'status')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )
    
    actions = ['approve_creators', 'reject_creators']
    
    def approve_creators(self, request, queryset):
        count = 0
        for profile in queryset:
            profile.status = 'approved'
            profile.verified = True
            profile.save()
            count += 1
            
        self.message_user(request, f'{count} creator(s) approved and activated successfully!')
    
    approve_creators.short_description = 'Approve and activate selected creators'
    
    def reject_creators(self, request, queryset):
        count = 0
        for profile in queryset:
            profile.status = 'rejected'
            profile.verified = False
            profile.save()
            count += 1
            
        self.message_user(request, f'{count} creator(s) rejected and deactivated.')
    
    reject_creators.short_description = 'Reject and deactivate selected creators'


@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'location', 'get_creator', 'created_at']
    list_filter = ['category', 'created_at']
    search_fields = ['name', 'description', 'location']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Place Information', {
            'fields': ('name', 'description', 'category', 'creator')
        }),
        ('Location Details', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Media', {
            'fields': ('image',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    def get_creator(self, obj):
        if obj.creator:
            return obj.creator.business_name
        return 'N/A'
    get_creator.short_description = 'Creator'


@admin.register(PlacePhoto)
class PlacePhotoAdmin(admin.ModelAdmin):
    list_display = ['place', 'caption', 'uploaded_by', 'created_at']
    list_filter = ['place', 'created_at']
    search_fields = ['place__name', 'caption']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Photo Information', {
            'fields': ('place', 'photo', 'caption', 'uploaded_by')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['user', 'place', 'is_public', 'created_at']
    list_filter = ['is_public', 'created_at']
    search_fields = ['caption', 'user__user__username', 'place__name']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Post Information', {
            'fields': ('user', 'place', 'caption')
        }),
        ('Media & Privacy', {
            'fields': ('photo', 'is_public')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['user', 'place', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['comment', 'user__user__username', 'place__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Review Information', {
            'fields': ('user', 'place', 'rating')
        }),
        ('Content', {
            'fields': ('comment', 'photo')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['user', 'place', 'created_at']
    list_filter = ['created_at']
    search_fields = ['user__user__username', 'place__name']
    readonly_fields = ['created_at']