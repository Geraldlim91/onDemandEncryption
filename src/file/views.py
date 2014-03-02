from django.shortcuts import render
from django.core.urlresolvers import reverse, reverse_lazy
from django.http import HttpResponseRedirect
from django.views.decorators.http import require_POST
import json
from jfu.http import upload_receive, JFUResponse, UploadResponse
from django.core.servers.basehttp import FileWrapper
import hashlib
from models import uploadedFile
from encryption import encrypt, decrypt
import os
from login.decorator import login_active_required
from jfu.http import upload_receive, JFUResponse, UploadResponse
from django.db.models import Q
from django.http import HttpResponse
from register.models import RegisterUser
import datetime

inputDir = os.path.join(os.path.abspath(os.path.join(os.path.realpath(__file__), '../../..')),'archive')

@login_active_required(login_url=reverse_lazy('login'))
def fileView(request, msgNote=""):
    # a = list(request.user.owns.all())
    # for i in a:
    #     print i.name
    otherVars = {}
    otherVars['pageType'] = 'logon'
    otherVars['UserInfo'] = request.user.first_name + ' ' + request.user.last_name
    # numOfRecords = uploadedFile.objects.all().count()
    numOfRecords = request.user.owns.all().count()
    # fileObjects= uploadedFile.objects.all().order_by('name')[:10]
    fileObjects =  list(request.user.owns.all().order_by('name')[:10])
    fileList = []
    contactList = []
    userList = request.user.follows.all()
    for i in userList:
        contactList.append(i.first_name + " "+i.last_name)

    otherVars['quota'] = str(round((float(request.user.uploaded_fileSize) / (1073741824)) * int(100),2)) # 1GB = 1073741824 bytes

    for fileObj in fileObjects:
        filesize = int(fileObj.filesize) / 1024
        fileList.append([
            fileObj.name,
            fileObj.hash,
            str(filesize) + "kb",
            fileObj.uploadDT,
            '<span class=\'fa fa-plus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/file/share/%s\'\"><b>&nbsp;Share</b></span>'%fileObj.name


        ])
    tableInfo = {'fileList':json.dumps(fileList),'numOfRecords':numOfRecords}
    listLength = len(fileList)
    if listLength > 0:
        tableInfo['recordStart'] = 1
        tableInfo['recordEnd'] = listLength
    if numOfRecords - 10 > 0:
        tableInfo['nextEnabled'] = 'Y'
    if request.method == 'POST':
        pass
        # Message to display when delete is pressed (<title>,<body>)
    delMsg = ('Delete file(s)?','File will be permanently deleted and cannot be recovered. Are you sure?')
    # Message to display when table has no records
    tabEmptyMsg = 'No file is available for viewing.'
    return render(request, 'main/fileview.html', {'contactList':contactList,'otherVars':otherVars, 'tableInfo':tableInfo,'delMsg':delMsg,'tabEmptyMsg':tabEmptyMsg})


@login_active_required(login_url=reverse_lazy('login'))
def fileViewUpdate(request):
    otherVars = {}
    if request.method == 'POST':
        pageLength = int(request.POST['pageLength'])
        sortingNames = ['name']
        recordStart = int(request.POST['recordStart'])
        recordEnd = int(request.POST['recordEnd'])
        sortOrder = []
        for val in json.loads(request.POST['sortingType']):
            sortOrder.append(('-' if val['order'] == 1 else '')+sortingNames[val['value']])
        query = Q()
        if 'searchText' in request.POST:
            searchText = json.loads(request.POST['searchText'])
            tSearchArr = []
            for sItem in searchText:
                if sItem['searchType'] == 'sText':
                    tSearchArr = [('name__icontains', sItem['searchTerm'])]
            for item in [Q(x) for x in tSearchArr]:
                query |= item
        if query:
            numOfRecords = request.user.owns.filter(query).count()
        else:
            numOfRecords = request.user.owns.all().count()

        if 'paginate' in request.POST:
            paginate = request.POST['paginate']
            if paginate == 'next':
                recordStart = recordEnd+1
            elif paginate == 'prev':
                recordStart = recordStart-pageLength
            elif paginate == 'first':
                recordStart = 1
            elif paginate == 'last':
                recordStart = numOfRecords-pageLength+1
        if recordStart > numOfRecords:
            recordStart = numOfRecords
        if recordStart < 1:
            recordStart = 1
        if 'firstSearch' in request.POST:
            recordStart = 1
        if query:
            fileObjects =  list(request.user.owns.filter(query).order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1])
        else:
            fileObjects =  list(request.user.owns.all().order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1])
        listLength = len(fileObjects)
        fileList = []
        for fileObj in fileObjects:
            filesize = int(fileObj.filesize) / 1024
            fileList.append([
                fileObj.name,
                fileObj.hash,
                str(filesize) + "kb",
                fileObj.uploadDT,
                '<span class=\'fa fa-plus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/file/share/%s\'\"><b>&nbsp;Share</b></span>'%fileObj.name


        ])
        tableInfo = {'valueList':fileList,'numOfRecords':numOfRecords}
        if listLength > 0:
            recordEnd = recordStart + listLength - 1
            if recordStart > 1:
                tableInfo['prevEnabled'] = 'Y'
            if recordEnd < numOfRecords:
                tableInfo['nextEnabled'] = 'Y'
        else:
            recordStart = 0
            recordEnd = 0
        tableInfo['recordStart'] = recordStart
        tableInfo['recordEnd'] = recordEnd
        return HttpResponse(json.dumps(tableInfo))
    else:
        return fileView(request)

@login_active_required(login_url=reverse_lazy('login'))
def shareToUserView(request, msgNote=""):
    otherVars = {}
    otherVars['pageType'] = 'logon'
    otherVars['UserInfo'] = request.user.first_name + ' ' + request.user.last_name
    numOfRecords = request.user.share.all().count()
    fileObjects =  list(request.user.share.all().order_by('name')[:10])
    fileList = []

    otherVars['quota'] = str(round((float(request.user.uploaded_fileSize) / (1073741824)) * int(100),2)) # 1GB = 1073741824 bytes
    for fileObj in fileObjects:
        owner = ''
        filesize = int(fileObj.filesize) / 1024
        fileList.append([
            fileObj.name,
            fileObj.hash,
            str(filesize) + "kb",
            fileObj.uploadDT,
            fileObj.ownerInfo
        ])
    tableInfo = {'fileList':json.dumps(fileList),'numOfRecords':numOfRecords}
    listLength = len(fileList)
    if listLength > 0:
        tableInfo['recordStart'] = 1
        tableInfo['recordEnd'] = listLength
    if numOfRecords - 10 > 0:
        tableInfo['nextEnabled'] = 'Y'
    if request.method == 'POST':
        pass
        # Message to display when delete is pressed (<title>,<body>)
    delMsg = ('Delete file(s)?','File will be permanently deleted and cannot be recovered. Are you sure?')
    # Message to display when table has no records
    tabEmptyMsg = 'No file is available for viewing'
    return render(request, 'main/sharetouserview.html', {'otherVars':otherVars, 'tableInfo':tableInfo,'delMsg':delMsg,'tabEmptyMsg':tabEmptyMsg})


@login_active_required(login_url=reverse_lazy('login'))
def shareToUserViewUpdate(request):
    otherVars = {}
    if request.method == 'POST':
        pageLength = int(request.POST['pageLength'])
        sortingNames = ['name']
        recordStart = int(request.POST['recordStart'])
        recordEnd = int(request.POST['recordEnd'])
        sortOrder = []
        for val in json.loads(request.POST['sortingType']):
            sortOrder.append(('-' if val['order'] == 1 else '')+sortingNames[val['value']])
        query = Q()
        if 'searchText' in request.POST:
            searchText = json.loads(request.POST['searchText'])
            tSearchArr = []
            for sItem in searchText:
                if sItem['searchType'] == 'sText':
                    tSearchArr = [('name__icontains', sItem['searchTerm'])]
            for item in [Q(x) for x in tSearchArr]:
                query |= item
        if query:
            numOfRecords = request.user.share.filter(query).count()
        else:
            numOfRecords = request.user.share.all().count()

        if 'paginate' in request.POST:
            paginate = request.POST['paginate']
            if paginate == 'next':
                recordStart = recordEnd+1
            elif paginate == 'prev':
                recordStart = recordStart-pageLength
            elif paginate == 'first':
                recordStart = 1
            elif paginate == 'last':
                recordStart = numOfRecords-pageLength+1
        if recordStart > numOfRecords:
            recordStart = numOfRecords
        if recordStart < 1:
            recordStart = 1
        if 'firstSearch' in request.POST:
            recordStart = 1
        if query:
            fileObjects =  list(request.user.share.filter(query).order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1])
        else:
            fileObjects =  list(request.user.share.all().order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1])
        listLength = len(fileObjects)
        fileList = []
        for fileObj in fileObjects:
            filesize = int(fileObj.filesize) / 1024
            fileList.append([
                fileObj.name,
                fileObj.hash,
                str(filesize) + "kb",
                fileObj.uploadDT,
                fileObj.ownerInfo
            ])

        tableInfo = {'valueList':fileList,'numOfRecords':numOfRecords}
        if listLength > 0:
            recordEnd = recordStart + listLength - 1
            if recordStart > 1:
                tableInfo['prevEnabled'] = 'Y'
            if recordEnd < numOfRecords:
                tableInfo['nextEnabled'] = 'Y'
        else:
            recordStart = 0
            recordEnd = 0
        tableInfo['recordStart'] = recordStart
        tableInfo['recordEnd'] = recordEnd
        return HttpResponse(json.dumps(tableInfo))
    else:
        return fileView(request)

@login_active_required(login_url=reverse_lazy('login'))
def fileShareView(request, fileName=None):
    otherVars = {}
    otherVars['pageType'] = 'logon'
    otherVars['UserInfo'] = request.user.first_name + ' ' + request.user.last_name
    if not fileName == None:
        otherVars['fileName'] = fileName
        numOfRecords = request.user.follows.all().count()
        friendObjects =  request.user.follows.all().order_by('first_name')[:10]
        friendList = []
        sharedList = []
        array = []
        list= uploadedFile.objects.filter(name=fileName)
        for i in list:
            sharedList = i.share_to.all()
        for u in sharedList:
            array.append(u.pk)

        for friendObj in friendObjects:
            check = ''
            if friendObj.pk in array:
                check = '<span class=\'fa fa-minus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/file/sharing/remove/%s/%s\'\"><b>&nbsp;Stop Sharing</b></span>'%(fileName,friendObj.pk)
            else:
                check = '<span class=\'fa fa-plus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/file/sharing/add/%s/%s\'\"><b>&nbsp;Share</b></span>'%(fileName,friendObj.pk)

            friendList.append([
                friendObj.first_name + " " + friendObj.last_name,
                check

            ])
        tableInfo = {'friendList':json.dumps(friendList),'numOfRecords':numOfRecords}
        listLength = len(friendList)
        if listLength > 0:
            tableInfo['recordStart'] = 1
            tableInfo['recordEnd'] = listLength
        if numOfRecords - 10 > 0:
            tableInfo['nextEnabled'] = 'Y'
        if request.method == 'POST':
            pass
            # Message to display when delete is pressed (<title>,<body>)
        delMsg = ('Delete file(s)?','File will be permanently deleted and cannot be recovered. Are you sure?')
        # Message to display when table has no records
        tabEmptyMsg = 'No friends available for viewing'
        return render(request, 'main/fileshare.html', {'otherVars':otherVars, 'tableInfo':tableInfo,'delMsg':delMsg,'tabEmptyMsg':tabEmptyMsg})
    else:
        return HttpResponseRedirect(reverse('fileShareView', args=fileName))

@login_active_required(login_url=reverse_lazy('login'))
def fileShareViewUpdate(request,fileName=None):
    otherVars = {}
    if request.method == 'POST' and not fileName==None:
        pageLength = int(request.POST['pageLength'])
        sortingNames = ['first_name']
        recordStart = int(request.POST['recordStart'])
        recordEnd = int(request.POST['recordEnd'])
        sortOrder = []
        for val in json.loads(request.POST['sortingType']):
            sortOrder.append(('-' if val['order'] == 1 else '')+sortingNames[val['value']])
        query = Q()
        if 'searchText' in request.POST:
            searchText = json.loads(request.POST['searchText'])
            tSearchArr = []
            for sItem in searchText:
                if sItem['searchType'] == 'sText':
                    tSearchArr = [('first_name__icontains', sItem['searchTerm'])]
            for item in [Q(x) for x in tSearchArr]:
                query |= item
        if query:
            numOfRecords = request.user.follows.filter(query).count()
            # numOfRecords = uploadedFile.objects.filter(query).count()
        else:
            # numOfRecords = uploadedFile.objects.all().count()
            numOfRecords = request.user.follows.all().count()

        if 'paginate' in request.POST:
            paginate = request.POST['paginate']
            if paginate == 'next':
                recordStart = recordEnd+1
            elif paginate == 'prev':
                recordStart = recordStart-pageLength
            elif paginate == 'first':
                recordStart = 1
            elif paginate == 'last':
                recordStart = numOfRecords-pageLength+1
        if recordStart > numOfRecords:
            recordStart = numOfRecords
        if recordStart < 1:
            recordStart = 1
        if 'firstSearch' in request.POST:
            recordStart = 1
        if query:
            friendObjects =  request.user.follows.filter(query).order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1]

        else:
            friendObjects =  request.user.follows.all().order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1]
        listLength = len(friendObjects)
        friendList = []
        sharedList = []
        array = []
        list= uploadedFile.objects.filter(name=fileName)
        for i in list:
            sharedList = i.share_to.all()
        for u in sharedList:
            array.append(u.pk)

        for friendObj in friendObjects:
            check = ''
            if friendObj.pk in array:
                check = '<span class=\'fa fa-minus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/file/share/remove/%s/%s\'\"><b>&nbsp;Stop Sharing</b></span>'%(fileName,friendObj.pk)
            else:
                check = '<span class=\'fa fa-plus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/file/share/add/%s/%s\'\"><b>&nbsp;Share</b></span>'%(fileName,friendObj.pk)

            friendList.append([
                friendObj.first_name + " " + friendObj.last_name,
                check

            ])
        tableInfo = {'valueList':friendList,'numOfRecords':numOfRecords}
        if listLength > 0:
            recordEnd = recordStart + listLength - 1
            if recordStart > 1:
                tableInfo['prevEnabled'] = 'Y'
            if recordEnd < numOfRecords:
                tableInfo['nextEnabled'] = 'Y'
        else:
            recordStart = 0
            recordEnd = 0
        tableInfo['recordStart'] = recordStart
        tableInfo['recordEnd'] = recordEnd
        return HttpResponse(json.dumps(tableInfo))
    else:
        return HttpResponseRedirect(reverse('fileView'))

@login_active_required(login_url=reverse_lazy('login'))
def fileSharing(request, fileName=None, targetID=None):
    if not fileName == None and not targetID == None:
        target = RegisterUser.objects.get(id=targetID)
        obj=uploadedFile.objects.get(name=fileName)
        obj.share_to.add(target)
        obj.save()

    return HttpResponseRedirect(reverse('fileShareView', kwargs={'fileName':fileName}))

@login_active_required(login_url=reverse_lazy('login'))
def fileRemoveSharing(request,fileName=None,targetID=None):
    if not fileName == None and not targetID == None:
        target = RegisterUser.objects.get(id=targetID)
        obj=uploadedFile.objects.get(name=fileName)
        obj.share_to.remove(target)
        obj.save()

    return HttpResponseRedirect(reverse('fileShareView', kwargs={'fileName':fileName}))

@login_active_required(login_url=reverse_lazy('login'))
def fileUpload(request):
    otherVars = {}
    otherVars['pageType'] = 'logon'
    otherVars['UserInfo'] = request.user.first_name + ' ' + request.user.last_name
    return render(request, 'main/upload.html',{'otherVars':otherVars,})

# @require_POST
def upload(request):
    uploadedfile = upload_receive(request)
    if not uploadedfile == None:
        if 'encryptKey' in request.POST:

            encryptionKey = request.POST['encryptKey']
            fileName = uploadedfile.name

            file_dict = {
                'name' : fileName,
                'size' : uploadedfile.size
                # The assumption is that file_field is a FileField that saves to
                # the 'media' directory.
                #                 'url': inputDir + '/' + basename,
                #                 'thumbnailUrl': inputDir + '/' + basename,
            }
            if (uploadedFile.objects.filter(name=fileName).count() > 0):
                file_dict['error'] = 'Failed to upload file! (file with same name already exists)'
            else:
                save_file(uploadedfile)
                fileHash = hashlib.md5(open(os.path.join(inputDir,fileName),'rb').read()).hexdigest()

                if (uploadedFile.objects.filter(hash=fileHash).count() > 0):
                    file_dict['error'] = 'Failed to upload file! (file with same name already exists)'
                    os.remove(os.path.join(inputDir, fileName))
                elif(uploadedfile.size == 0):
                    file_dict['error'] = 'Failed to upload file! (file does not have any content)'
                else:
                    uid = fileHash[:8] + str(request.user.pk)
                    os.rename(os.path.join(inputDir,fileName), os.path.join(inputDir,uid))
                    instance = uploadedFile()
                    instance.uid = uid
                    instance.hash = fileHash
                    instance.key = encryptionKey
                    instance.filesize = uploadedfile.size
                    instance.name = fileName
                    instance.ownerInfo = request.user.first_name + " " + request.user.last_name
                    instance.uploadDT = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    instance.save()
                    request.user.owns.add(instance)
                    request.user.uploaded_fileSize = str(int(request.user.uploaded_fileSize) + int(uploadedfile.size))
                    request.user.save()
                    file_dict['deleteUrl'] = reverse('jfu_delete', kwargs = { 'pk': instance.uid })
                    file_dict['deleteType'] = 'POST'
                    # os.system("mpiexec.openmpi -np 3 -machinefile /home/pi/machine python -c \"execfile('/home/pi/onDemandEncrypt/src/file/encryption.py');encrypt('%s','%s','$s',$d)")%(os.path.join(inputDir,uid), inputDir + "/encrypted/" + uid,encryptionKey,32)
                    encrypt(os.path.join(inputDir,uid), inputDir + "/encrypted/" + uid,encryptionKey,32)



        else:
            file_dict = {
                'error':'Missing encryption key!'
            }
        return UploadResponse(request, file_dict)
    else:
        return HttpResponseRedirect(reverse('login'))

@require_POST
def upload_delete(request,pk):
         # An example implementation.
    success = True
    try:
        instance = uploadedFile.objects.get(uid=pk)
        os.remove(os.path.join(inputDir + '/encrypted/', instance.uid))
        instance.delete()
    except uploadedFile.DoesNotExist:
        success = False

    return JFUResponse( request, success )

def save_file(uploadedfile):
    filename = uploadedfile._get_name()
    path = inputDir
    if not os.path.exists(path):
        os.makedirs(path)
    fd = open('%s/%s' % (path, str(filename)), 'w+')
    for chunk in uploadedfile.chunks():
        fd.write(chunk)
    fd.close()

def get_or_none(model, **kwargs):
    try:
        return model.objects.get(**kwargs)
    except model.DoesNotExist:
        return None

@login_active_required(login_url=reverse_lazy('login'))
def downloadFile(request, fileName=None):
    if get_or_none(uploadedFile, name=fileName):
        # list the files in input directory
        fileObjects= uploadedFile.objects.filter(name=fileName)
        if (fileName == 'null'):
            request.session['msgNote'] = ['fileView',{'sign':'error','msg':'Invalid file specified!'}]
            return fileView(request)
            # return a file object if file exist
        key = ''
        for fileObj in fileObjects:
            if fileObj.share_to.filter(pk=request.user.pk) or fileObj.owner.get().pk == request.user.pk:
                key = fileObj.key
                fileuid = os.path.join(inputDir + '/encrypted/' ,fileObj.uid)
            else:
                key = None

        if not key == None:
            dfilename = os.path.join(inputDir + '/decrypted/',fileName)
            decrypt(fileuid, dfilename, key, 32)
            wrapper = FileWrapper(file(dfilename))
            response = HttpResponse(wrapper, content_type='text/plain')
            response['Content-Length'] = os.path.getsize(dfilename)
            response['Content-Disposition'] = 'attachment; filename=%s' % fileName
            os.remove(dfilename)
            return response
        else:
            return HttpResponseRedirect(reverse('fileView'))

    else:
        request.session['msgNote'] = ['fileView',{'sign':'error','msg':'Invalid file specified!'}]
        return HttpResponseRedirect(reverse(fileView))

@login_active_required(login_url=reverse_lazy('login'))
def fileDel(request, fileName=None):
    if not fileName == None:
        fileList = []
        if ';' in fileName:
            valueList = fileName.split(';')
            for val in valueList:
                delFile = get_or_none(uploadedFile, name=val)
                if delFile:
                    fileList.append(delFile)
        else:
            delFile = get_or_none(uploadedFile, name=fileName)
            if delFile:
                fileList.append(delFile)

        fileName = ""
        # get the files in inputdir
        inputFilesArr = os.listdir(inputDir + '/encrypted/')
        for fileObj in fileList:
            fileName = fileObj.uid
            if fileName not in inputFilesArr:
                fileObj.delete()
                continue
            else:
                os.remove(os.path.join(inputDir + '/encrypted/', fileName))
                fileObj.delete()

        return HttpResponseRedirect(reverse('fileView'))
    else:
        return HttpResponseRedirect(reverse('fileView'))

