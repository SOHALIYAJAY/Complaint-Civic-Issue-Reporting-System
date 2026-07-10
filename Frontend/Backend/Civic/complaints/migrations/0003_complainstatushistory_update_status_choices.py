from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('complaints', '0002_complaint_remarks_complaint_resolved_time_and_more'),
        ('departments', '0006_alter_department_category'),
    ]

    operations = [
        # Update status choices on Complaint (data migration not needed — values are stored as strings)
        migrations.AlterField(
            model_name='complaint',
            name='status',
            field=models.CharField(
                choices=[('Pending', 'Pending'), ('In Process', 'In Process'), ('Completed', 'Completed')],
                default='Pending',
                max_length=20,
            ),
        ),
        migrations.CreateModel(
            name='ComplaintStatusHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(
                    choices=[('Pending', 'Pending'), ('In Process', 'In Process'), ('Completed', 'Completed')],
                    max_length=20,
                )),
                ('remarks', models.TextField(blank=True, default='')),
                ('timestamp', models.DateTimeField(default=django.utils.timezone.now)),
                ('complaint', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='status_history',
                    to='complaints.complaint',
                )),
                ('changed_by', models.ForeignKey(
                    blank=True,
                    null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    to='departments.officer',
                )),
            ],
            options={'ordering': ['timestamp']},
        ),
    ]
