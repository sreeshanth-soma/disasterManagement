from django.core.management.base import BaseCommand
from django_celery_beat.models import PeriodicTask, CrontabSchedule
import json


class Command(BaseCommand):
    help = 'Set up periodic social media scraping tasks'

    def handle(self, *args, **options):
        # Create a schedule to run every 15 minutes
        schedule, created = CrontabSchedule.objects.get_or_create(
            minute='*/15',
            hour='*',
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Created crontab schedule for every 15 minutes')
            )
        
        # Create the periodic task for social media scraping
        task, created = PeriodicTask.objects.get_or_create(
            name='Social Media Flood Scraping',
            defaults={
                'crontab': schedule,
                'task': 'flood_app.tasks.scrape_social_media',
                'args': json.dumps([]),
                'kwargs': json.dumps({}),
                'enabled': True,
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Created periodic task for social media scraping')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Periodic task already exists')
            )
        
        # Create a schedule to run cleanup daily at 2 AM
        cleanup_schedule, created = CrontabSchedule.objects.get_or_create(
            minute='0',
            hour='2',
            day_of_week='*',
            day_of_month='*',
            month_of_year='*',
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Created crontab schedule for daily cleanup at 2 AM')
            )
        
        # Create the periodic task for cleanup
        cleanup_task, created = PeriodicTask.objects.get_or_create(
            name='Social Media Posts Cleanup',
            defaults={
                'crontab': cleanup_schedule,
                'task': 'flood_app.tasks.cleanup_old_social_media_posts',
                'args': json.dumps([]),
                'kwargs': json.dumps({}),
                'enabled': True,
            }
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Created periodic task for cleanup')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Cleanup task already exists')
            )
        
        self.stdout.write(
            self.style.SUCCESS('Social media scraping setup completed!')
        )
        self.stdout.write(
            self.style.WARNING(
                'Remember to set up your API keys:\n'
                '- TWITTER_BEARER_TOKEN for Twitter API\n'
                '- YOUTUBE_API_KEY for YouTube API\n'
                'Add these to your .env file or environment variables.'
            )
        )
