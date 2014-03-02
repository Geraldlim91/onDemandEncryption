from django.conf.urls import patterns, include, url

urlpatterns = patterns('',
    url(r'^main/', include('login.urls'),),
    url(r'^main/', include('register.urls')),
    url(r'^main/', include('file.urls')),
    url(r'^main/', include('profile.urls')),
)




