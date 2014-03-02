from django.conf.urls import patterns, url
from django.views.generic import RedirectView
from django.core.urlresolvers import reverse_lazy


urlpatterns = patterns('file.views',
    url(r'^upload/$', 'fileUpload', name='fileUpload'),
    url(r'^upload/uploadfile/', 'upload', name='jfu_upload'),
    url(r'^upload/deletefile/(?P<pk>.+)$', 'upload_delete', name = 'jfu_delete' ),
    url(r'^file/$', 'fileView', name='fileView'),
    url(r'^file/new/$', 'fileViewUpdate', name='fileViewUpdate'),
    url(r'^file/shared/$', 'shareToUserView', name='shareToUserView'),
    url(r'^file/shared/new/$', 'shareToUserViewUpdate', name='shareToUserViewUpdate'),
    url(r'^download/$', RedirectView.as_view(url=reverse_lazy('fileView')), name='downloadFileURL'),
    url(r'^download/(?P<fileName>.+)$', 'downloadFile', name='downloadFile'),

    url(r'^share/download/$', RedirectView.as_view(url=reverse_lazy('shareToUserView')), name='downloadShareFileURL'),
    url(r'^share/download/(?P<fileName>.+)$', 'downloadFile', name='downloadFile'),

    # url(r'^download/share/$', RedirectView.as_view(url=reverse_lazy('shareToUserView')), name='downloadShareFileURL'),
    # url(r'^download/share/(?P<fileName>.+)$', 'downloadFile', name='downloadFile'),

    url(r'^filedel/$', RedirectView.as_view(url=reverse_lazy('fileView')), name='fileDelURL'),
    url(r'^filedel/(?P<fileName>.+)$', 'fileDel', name='fileDel'),
    url(r'^file/share/(?P<fileName>.+)$', 'fileShareView', name='fileShareView'),
    url(r'^file/share/new/(?P<fileName>.+)$', 'fileShareViewUpdate', name='fileShareViewUpdate'),
    url(r'^file/sharing/add/(?P<fileName>.+)/(?P<targetID>[.\w ]+)$', 'fileSharing', name='fileSharing'),
    url(r'^file/sharing/remove/(?P<fileName>.+)/(?P<targetID>[.\w ]+)$', 'fileRemoveSharing', name='fileRemoveSharing'),

    )