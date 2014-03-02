from neo4django.db import models
from register.models import RegisterUser

class uploadedFile(models.NodeModel):
    name = models.StringProperty()
    hash = models.StringProperty()

    key = models.StringProperty()
    uploadDT = models.StringProperty()
    filesize = models.StringProperty()
    ownerInfo = models.StringProperty()
    uid = models.StringProperty()
    owner = models.Relationship(RegisterUser, rel_type='own_by',
                                related_name='owns')
    share_to = models.Relationship(RegisterUser, rel_type='share_to',
                                related_name='share')
