from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.models import UserProfile, CreatorProfile, Place


class Command(BaseCommand):
    help = 'Populate database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting data population...')
        
        # Create default admin/creator user if doesn't exist
        if not User.objects.filter(username='defaultcreator').exists():
            user = User.objects.create_user(
                username='defaultcreator',
                email='creator@artmap.com',
                password='creator123'
            )
            self.stdout.write(self.style.SUCCESS(f' Created user: {user.username}'))
        else:
            user = User.objects.get(username='defaultcreator')
            self.stdout.write(f'User already exists: {user.username}')
        
        # Create UserProfile
        user_profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'bio': 'Default system creator for pre-existing places',
                'is_creator': True
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f' Created UserProfile'))
        
        # Create CreatorProfile
        creator_profile, created = CreatorProfile.objects.get_or_create(
            user_profile=user_profile,
            defaults={
                'business_name': 'ArtMap Default Listings',
                'business_description': 'Default creator profile for system-managed art spaces',
                'category': 'gallery',
                'verified': True,
                'status': 'approved'
            }
        )
        if created:
            self.stdout.write(self.style.SUCCESS(f'✓ Created CreatorProfile: {creator_profile.business_name}'))
        
        # Create Places
        places_data = [
            {
                'name': 'Patan Museum',
                'description': 'Historic museum in Patan Durbar Square showcasing traditional Nepalese art, bronzes, and cultural artifacts',
                'category': 'museum',
                'location': 'Patan Durbar Square, Lalitpur',
                'latitude': 27.6726,
                'longitude': 85.3264,
            },
            {
                'name': 'Siddhartha Art Gallery',
                'description': 'Contemporary art gallery showcasing modern Nepalese and international artists',
                'category': 'gallery',
                'location': 'Babar Mahal Revisited, Kathmandu',
                'latitude': 27.6989,
                'longitude': 85.3206,
            },
            {
                'name': 'Nepal Art Council',
                'description': 'Government art gallery displaying works by Nepali artists and hosting exhibitions',
                'category': 'gallery',
                'location': 'Babar Mahal, Kathmandu',
                'latitude': 27.6991,
                'longitude': 85.3211,
            },
            {
                'name': 'Kathmandu Contemporary Art Centre',
                'description': 'Modern art space featuring contemporary exhibitions and cultural events',
                'category': 'gallery',
                'location': 'Sanepa, Lalitpur',
                'latitude': 27.6869,
                'longitude': 85.3072,
            },
            {
                'name': 'The Gallery Café',
                'description': 'Art café combining fine dining with rotating art exhibitions',
                'category': 'gallery',
                'location': 'Thamel, Kathmandu',
                'latitude': 27.7172,
                'longitude': 85.3107,
            },
            {
                'name': 'Artudio',
                'description': 'Creative studio offering art workshops and classes in painting and pottery',
                'category': 'studio',
                'location': 'Jhamsikhel, Lalitpur',
                'latitude': 27.6844,
                'longitude': 85.3089,
            },
            {
                'name': 'Bhaktapur Pottery Square',
                'description': 'Traditional pottery workshop where artisans create handmade ceramics',
                'category': 'workshop',
                'location': 'Bhaktapur Durbar Square',
                'latitude': 27.6728,
                'longitude': 85.4298,
            },
            {
                'name': 'Taragaon Museum',
                'description': 'Museum of Nepali architectural history and culture',
                'category': 'museum',
                'location': 'Boudha, Kathmandu',
                'latitude': 27.7215,
                'longitude': 85.3628,
            },
            {
                'name': 'Moti Azima Gallery',
                'description': 'Contemporary gallery focusing on modern Nepali and South Asian art',
                'category': 'gallery',
                'location': 'Lazimpat, Kathmandu',
                'latitude': 27.7244,
                'longitude': 85.3246,
            },
            {
                'name': 'Thangka Painting Workshop',
                'description': 'Traditional Tibetan Buddhist thangka painting classes and demonstrations',
                'category': 'workshop',
                'location': 'Boudhanath, Kathmandu',
                'latitude': 27.7206,
                'longitude': 85.3616,
            },
        ]
        
        for place_data in places_data:
            place, created = Place.objects.get_or_create(
                name=place_data['name'],
                defaults={
                    **place_data,
                    'creator': creator_profile
                }
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f' Created place: {place.name}'))
            else:
                self.stdout.write(f'Place already exists: {place.name}')
        
        self.stdout.write(self.style.SUCCESS('\n Data population complete!'))
        self.stdout.write(f'\nCreated:')
        self.stdout.write(f'  - 1 Creator user (username: defaultcreator, password: creator123)')
        self.stdout.write(f'  - {Place.objects.count()} Places')