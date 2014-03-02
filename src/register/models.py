from neo4django.db import models
from neo4django.graph_auth.models import User, UserManager
# Create your models here.
class RegisterUser(User):
    objects = UserManager()
    company = models.StringProperty(default='N.A')
    contact_num = models.StringProperty(default='N.A')
    uploaded_fileSize = models.StringProperty(default='0')
    follows = models.Relationship('self' ,rel_type='follows',
                                  related_name='followed_by')

