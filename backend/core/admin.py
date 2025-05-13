from django.contrib import admin
from .models import User, Project, Task, RoleAccess, TimeReport

# Register your models here
admin.site.register(User)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(RoleAccess)
admin.site.register(TimeReport)
