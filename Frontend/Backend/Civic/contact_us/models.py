from django.db import models

# Create your models here.
class contact_us(models.Model):
    CHOICE_SUBJECT=(
        ('general','general'),
        ('complaint','complaint'),
        ('feedback','feedback')
    )

    full_name=models.CharField(max_length=50)
    email=models.CharField(max_length=50)
    subject=models.CharField(max_length=20, choices=CHOICE_SUBJECT)
    message=models.TextField(max_length=200)
