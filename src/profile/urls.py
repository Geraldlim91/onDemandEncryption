from django.conf.urls import patterns, url
from django.views.generic import RedirectView
from django.core.urlresolvers import reverse_lazy

urlpatterns = patterns('profile.views',
    url(r'^profile/$', 'editProfile', name='editProfile'),
    url(r'^chgpasswd/$', 'changePassword', name='changePassword'),
    url(r'^friends/$', 'friendView', name='friendView'),
    url(r'^friends/new/$', 'friendViewUpdate', name='friendViewUpdate'),
    url(r'^friends/add/$', RedirectView.as_view(url=reverse_lazy('fileView')), name='addFriendURL'),
    url(r'^friends/add/(?P<email>[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4})$', 'addFriend', name='addFriend'),
    url(r'^friends/del/$', RedirectView.as_view(url=reverse_lazy('fileView')), name='delFriendURL'),
    url(r'^friends/del/(?P<email>[\w.%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4})$', 'delFriend', name='delFriend'),

    )