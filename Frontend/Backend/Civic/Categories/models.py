from django.db import models


class Category(models.Model):
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=50)
    department = models.CharField(max_length=50, blank=True, default='')
    total_comp = models.IntegerField(default=0)

    def __str__(self):
        return self.name