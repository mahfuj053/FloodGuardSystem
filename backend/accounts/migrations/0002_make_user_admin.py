from django.db import migrations

def make_admin(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    email = "ahmedalif1011@gmail.com"
    try:
        user = User.objects.get(email=email)
        user.is_staff = True
        user.is_superuser = True
        if hasattr(user, 'role'):
            user.role = 'admin'
        user.save()
    except User.DoesNotExist:
        pass

class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'), 
    ]

    operations = [
        migrations.RunPython(make_admin),
    ]