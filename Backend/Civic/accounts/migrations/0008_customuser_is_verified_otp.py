from django.db import migrations, models


def sync_is_verified_from_email_verified(apps, schema_editor):
    CustomUser = apps.get_model('accounts', 'CustomUser')
    CustomUser.objects.filter(email_verified=True).update(is_verified=True)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_alter_customuser_groups_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='customuser',
            name='is_verified',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='customuser',
            name='otp',
            field=models.CharField(blank=True, max_length=6, null=True),
        ),
        migrations.RunPython(sync_is_verified_from_email_verified, migrations.RunPython.noop),
    ]
