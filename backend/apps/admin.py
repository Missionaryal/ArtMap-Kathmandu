# admin.py
# This file customises the Django admin panel for ArtMap.
# Instead of the default plain tables, we get styled columns, coloured badges,
# and inline forms — all using the Unfold admin theme.

from django.contrib import admin
from django.utils.html import format_html
from django.urls import reverse
from unfold.admin import ModelAdmin, TabularInline
from .models import (
    UserProfile, CreatorProfile, Place, PlacePhoto,
    Post, Review, Bookmark, Event, Booking
)


# Reusable helper that builds Edit and Remove action links for any list row.
# This avoids repeating the same HTML in every admin class.
def actions_col(app, model, pk):
    edit_url = reverse(f"admin:{app}_{model}_change", args=[pk])
    delete_url = reverse(f"admin:{app}_{model}_delete", args=[pk])
    return format_html(
        '<a href="{}" style="color:#c9a961;font-weight:500;font-size:13px;text-decoration:none;">Edit</a>'
        '<a href="{}" style="color:#dc2626;font-weight:500;font-size:13px;text-decoration:none;margin-left:12px;">Remove</a>',
        edit_url, delete_url
    )


# Base class for all our admin models.
# Removes the extra "Save and add another" and "Save and continue editing" buttons
# to keep the forms clean and simple.
class SimpleAdmin(ModelAdmin):
    save_on_top = False

    def render_change_form(self, request, context, *args, **kwargs):
        context["show_save_and_add_another"] = False
        context["show_save_and_continue"] = False
        return super().render_change_form(request, context, *args, **kwargs)


# Shows place photos as an inline table inside the Place edit form.
# This way you can manage photos without leaving the place page.
class PlacePhotoInline(TabularInline):
    model = PlacePhoto
    extra = 0
    fields = ["photo", "caption"]


# Shows bookings as an inline table inside the Event edit form.
class BookingInline(TabularInline):
    model = Booking
    extra = 0
    fields = ["name", "email", "phone", "spots", "created_at"]
    readonly_fields = ["created_at"]


# Admin for UserProfile — shows all registered users with their role and status
@admin.register(UserProfile)
class UserProfileAdmin(SimpleAdmin):
    list_display = ["name_col", "email_col", "role_col", "joined_col", "status_col", "row_actions"]
    list_filter = ["is_creator", "user__is_active"]
    search_fields = ["user__username", "user__email"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("User", {"fields": ("user", "is_creator")}),
    )

    def name_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.user.username)
    name_col.short_description = "Name"

    def email_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.user.email)
    email_col.short_description = "Email"

    # Shows a coloured badge: gold for Creator, grey for regular User
    def role_col(self, obj):
        if obj.is_creator:
            return format_html('<span style="background:#fef3c7;color:#d97706;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Creator</span>')
        return format_html('<span style="background:#f5f5f4;color:#78716c;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">User</span>')
    role_col.short_description = "Role"

    def joined_col(self, obj):
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', obj.created_at.strftime("%b %d, %Y"))
    joined_col.short_description = "Joined"

    # Shows green dot for active, grey for inactive (pending/rejected creators)
    def status_col(self, obj):
        if obj.user.is_active:
            return format_html('<span style="color:#16a34a;font-size:13px;">&#x25CF; Active</span>')
        return format_html('<span style="color:#78716c;font-size:13px;">&#x25CF; Inactive</span>')
    status_col.short_description = "Status"

    def row_actions(self, obj):
        return actions_col("apps", "userprofile", obj.pk)
    row_actions.short_description = "Actions"


# Admin for CreatorProfile — this is where the admin approves or rejects creators
@admin.register(CreatorProfile)
class CreatorProfileAdmin(SimpleAdmin):
    list_display = ["business_col", "user_col", "category_col", "status_col", "row_actions"]
    list_filter = ["status", "category"]
    search_fields = ["business_name", "user_profile__user__username"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]
    # Bulk actions for approving or rejecting multiple creators at once
    actions = ["approve_creators", "reject_creators"]

    fieldsets = (
        ("Business", {"fields": ("business_name", "business_description", "category")}),
        ("Verification", {"fields": ("status", "verified")}),
    )

    def business_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.business_name)
    business_col.short_description = "Business"

    def user_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.user_profile.user.username)
    user_col.short_description = "Submitted By"

    def category_col(self, obj):
        return format_html('<span style="color:#78716c;text-transform:capitalize;">{}</span>', obj.get_category_display())
    category_col.short_description = "Category"

    # Coloured status badge: yellow for pending, green for approved, red for rejected
    def status_col(self, obj):
        styles = {
            "pending":  "background:#fef3c7;color:#d97706;",
            "approved": "background:#dcfce7;color:#16a34a;",
            "rejected": "background:#fee2e2;color:#dc2626;",
        }
        labels = {"pending": "Pending", "approved": "Approved", "rejected": "Rejected"}
        style = styles.get(obj.status, "")
        label = labels.get(obj.status, obj.status)
        return format_html(
            '<span style="{}padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">{}</span>',
            style, label
        )
    status_col.short_description = "Status"

    def row_actions(self, obj):
        edit_url = reverse("admin:apps_creatorprofile_change", args=[obj.pk])
        delete_url = reverse("admin:apps_creatorprofile_delete", args=[obj.pk])
        return format_html(
            '<a href="{}" style="color:#c9a961;font-weight:500;font-size:13px;text-decoration:none;">Review</a>'
            '<a href="{}" style="color:#dc2626;font-weight:500;font-size:13px;text-decoration:none;margin-left:12px;">Remove</a>',
            edit_url, delete_url
        )
    row_actions.short_description = "Actions"

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        user = obj.user_profile.user
        # When status changes to approved, activate the user account so they can log in
        if obj.status == "approved":
            obj.verified = True
            obj.save(update_fields=["verified"])
            user.is_active = True
            user.save()
        # When status changes to rejected, disable the account
        elif obj.status == "rejected":
            obj.verified = False
            obj.save(update_fields=["verified"])
            user.is_active = False
            user.save()

    # Bulk approve — activates all selected creator accounts at once
    def approve_creators(self, request, queryset):
        for profile in queryset:
            profile.status = "approved"
            profile.verified = True
            profile.save()
            profile.user_profile.user.is_active = True
            profile.user_profile.user.save()
        self.message_user(request, f"{queryset.count()} creator(s) approved.")
    approve_creators.short_description = "Approve selected creators"

    # Bulk reject — disables all selected creator accounts at once
    def reject_creators(self, request, queryset):
        for profile in queryset:
            profile.status = "rejected"
            profile.verified = False
            profile.save()
            profile.user_profile.user.is_active = False
            profile.user_profile.user.save()
        self.message_user(request, f"{queryset.count()} creator(s) rejected.")
    reject_creators.short_description = "Reject selected creators"


# Admin for Place — shows all cultural locations on the platform
@admin.register(Place)
class PlaceAdmin(SimpleAdmin):
    list_display = ["name_col", "category_col", "creator_col", "rating_col", "added_col", "row_actions"]
    list_filter = ["category"]
    search_fields = ["name", "location", "creator__business_name"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]
    # Show the place's photo gallery inline on the edit page
    inlines = [PlacePhotoInline]

    fieldsets = (
        ("Basic Information", {"fields": ("name", "description", "category", "creator")}),
        ("Location", {"fields": ("location", "latitude", "longitude")}),
        ("Contact", {"fields": ("phone", "email", "website", "operating_hours")}),
        ("Media", {"fields": ("image",)}),
    )

    def name_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.name)
    name_col.short_description = "Name"

    def category_col(self, obj):
        return format_html('<span style="color:#78716c;text-transform:capitalize;">{}</span>', obj.get_category_display())
    category_col.short_description = "Category"

    def creator_col(self, obj):
        if obj.creator:
            return format_html('<span style="color:#78716c;">{}</span>', obj.creator.business_name)
        return format_html('<span style="color:#d4d0cc;">-</span>')
    creator_col.short_description = "Creator"

    def rating_col(self, obj):
        if obj.average_rating:
            return format_html('<span style="color:#78716c;">{} / 5</span>', obj.average_rating)
        return format_html('<span style="color:#d4d0cc;">No reviews</span>')
    rating_col.short_description = "Rating"

    def added_col(self, obj):
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', obj.created_at.strftime("%b %d, %Y"))
    added_col.short_description = "Added"

    def row_actions(self, obj):
        return actions_col("apps", "place", obj.pk)
    row_actions.short_description = "Actions"


# Admin for Event — shows all workshops, classes, and exhibitions
@admin.register(Event)
class EventAdmin(SimpleAdmin):
    list_display = ["title_col", "creator_col", "date_col", "spots_col", "price_col", "status_col", "row_actions"]
    list_filter = ["event_type", "is_published", "is_free"]
    search_fields = ["title", "creator__business_name"]
    readonly_fields = ["created_at", "updated_at", "spots_taken"]
    ordering = ["date"]
    # Show bookings inline on the event edit page
    inlines = [BookingInline]

    fieldsets = (
        ("Event", {"fields": ("creator", "place", "title", "description", "event_type", "image")}),
        ("Schedule", {"fields": ("date", "start_time", "duration_hours")}),
        ("Pricing & Capacity", {"fields": ("is_free", "price", "total_spots", "spots_taken")}),
        ("Status", {"fields": ("is_published", "is_cancelled")}),
    )

    def title_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.title)
    title_col.short_description = "Title"

    def creator_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.creator.business_name)
    creator_col.short_description = "Creator"

    def date_col(self, obj):
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', obj.date.strftime("%b %d, %Y"))
    date_col.short_description = "Date"

    def spots_col(self, obj):
        return format_html('<span style="color:#78716c;">{} / {}</span>', obj.spots_taken, obj.total_spots)
    spots_col.short_description = "Spots"

    def price_col(self, obj):
        if obj.is_free:
            return format_html('<span style="color:#16a34a;font-weight:600;">Free</span>')
        return format_html('<span style="color:#78716c;">NPR {}</span>', obj.price)
    price_col.short_description = "Price"

    # Green "Published" badge or grey "Draft" badge
    def status_col(self, obj):
        if obj.is_published:
            return format_html('<span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Published</span>')
        return format_html('<span style="background:#f5f5f4;color:#78716c;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Draft</span>')
    status_col.short_description = "Status"

    def row_actions(self, obj):
        return actions_col("apps", "event", obj.pk)
    row_actions.short_description = "Actions"


# Admin for Booking — shows all event reservations
@admin.register(Booking)
class BookingAdmin(SimpleAdmin):
    list_display = ["name_col", "email_col", "event_col", "spots_col", "date_col", "row_actions"]
    list_filter = ["created_at"]
    search_fields = ["name", "email", "event__title"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("Booking", {"fields": ("event", "name", "email", "phone", "spots")}),
    )

    def name_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.name)
    name_col.short_description = "Name"

    def email_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.email)
    email_col.short_description = "Email"

    def event_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.event.title)
    event_col.short_description = "Event"

    def spots_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.spots)
    spots_col.short_description = "Spots"

    def date_col(self, obj):
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', obj.created_at.strftime("%b %d, %Y"))
    date_col.short_description = "Booked On"

    def row_actions(self, obj):
        return actions_col("apps", "booking", obj.pk)
    row_actions.short_description = "Actions"


# Admin for Post — shows all user photo posts
@admin.register(Post)
class PostAdmin(SimpleAdmin):
    list_display = ["user_col", "place_col", "visibility_col", "date_col", "row_actions"]
    list_filter = ["is_public"]
    search_fields = ["caption", "user__user__username", "place__name"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("Post", {"fields": ("user", "place", "caption", "photo", "is_public")}),
    )

    def user_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.user.user.username)
    user_col.short_description = "User"

    def place_col(self, obj):
        if obj.place:
            return format_html('<span style="color:#78716c;">{}</span>', obj.place.name)
        return format_html('<span style="color:#d4d0cc;">-</span>')
    place_col.short_description = "Place"

    # Green "Public" badge or grey "Private" badge
    def visibility_col(self, obj):
        if obj.is_public:
            return format_html('<span style="background:#dcfce7;color:#16a34a;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Public</span>')
        return format_html('<span style="background:#f5f5f4;color:#78716c;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">Private</span>')
    visibility_col.short_description = "Visibility"

    def date_col(self, obj):
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', obj.created_at.strftime("%b %d, %Y"))
    date_col.short_description = "Posted"

    def row_actions(self, obj):
        return actions_col("apps", "post", obj.pk)
    row_actions.short_description = "Actions"


# Admin for Review — shows all user reviews with star ratings
@admin.register(Review)
class ReviewAdmin(SimpleAdmin):
    list_display = ["user_col", "place_col", "rating_col", "comment_col", "date_col", "row_actions"]
    list_filter = ["rating"]
    search_fields = ["comment", "user__user__username", "place__name"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("Review", {"fields": ("user", "place", "rating", "comment", "photo")}),
    )

    def user_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.user.user.username)
    user_col.short_description = "User"

    def place_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.place.name)
    place_col.short_description = "Place"

    # Green for 4-5 stars, yellow for 3, red for 1-2
    def rating_col(self, obj):
        color = "#16a34a" if obj.rating >= 4 else "#d97706" if obj.rating == 3 else "#dc2626"
        return format_html('<span style="color:{};font-weight:600;">{} / 5</span>', color, obj.rating)
    rating_col.short_description = "Rating"

    # Only show the first 60 characters of the comment to keep the list readable
    def comment_col(self, obj):
        text = obj.comment[:60] + "..." if len(obj.comment) > 60 else obj.comment
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', text)
    comment_col.short_description = "Comment"

    def date_col(self, obj):
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', obj.created_at.strftime("%b %d, %Y"))
    date_col.short_description = "Date"

    def row_actions(self, obj):
        return actions_col("apps", "review", obj.pk)
    row_actions.short_description = "Actions"


# Admin for Bookmark — shows which users saved which places
@admin.register(Bookmark)
class BookmarkAdmin(SimpleAdmin):
    list_display = ["user_col", "place_col", "date_col", "row_actions"]
    search_fields = ["user__user__username", "place__name"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]

    fieldsets = (
        ("Bookmark", {"fields": ("user", "place")}),
    )

    def user_col(self, obj):
        return format_html('<span style="font-weight:600;color:#1c1917;">{}</span>', obj.user.user.username)
    user_col.short_description = "User"

    def place_col(self, obj):
        return format_html('<span style="color:#78716c;">{}</span>', obj.place.name)
    place_col.short_description = "Place"

    def date_col(self, obj):
        return format_html('<span style="color:#78716c;font-size:13px;">{}</span>', obj.created_at.strftime("%b %d, %Y"))
    date_col.short_description = "Saved On"

    def row_actions(self, obj):
        return actions_col("apps", "bookmark", obj.pk)
    row_actions.short_description = "Actions"