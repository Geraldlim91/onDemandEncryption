from django.shortcuts import render
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse,reverse_lazy
from decorator import login_active_required
import os
from register.models import RegisterUser
from forms import UpdateUserInfoForm, ChangePasswordForm
import json
from django.db.models import Q
from django.core.urlresolvers import reverse, reverse_lazy
from django.http import HttpResponseRedirect,HttpResponse

# view page for changing profile information
@login_active_required(login_url=reverse_lazy('login'))
def editProfile(request,msgNote=''):
    otherVars = {}
    #     print resolve(request.path_info).url_name
    otherVars['pageType'] = 'logon'
    otherVars['UserInfo'] = request.user.first_name + ' ' + request.user.last_name
    # get the mobile device the user registered
    # displayMsg = None
    # if msgNote:
    #     displayMsg = msgNote
    # elif 'msgNote' in request.session:
    #     displayMsg = request.session['msgNote']
    userInfo = RegisterUser.objects.filter(username=request.user)
    allFields = []
    # if there is registered user
    if len(userInfo) != 0:
        index = 1
        # format of the user information
        for eachField in userInfo:
            fields = {}
            fields['no'] = index
            index += 1
            fields['email'] = eachField.email
            fields['first_name'] = eachField.first_name
            fields['last_name'] = eachField.last_name
            fields['contact_num'] = eachField.contact_num
            fields['company'] = eachField.company
            allFields.append(fields)
 
    # if request method is post
    if request.method == 'POST':
        form1 = UpdateUserInfoForm(request.POST, instance=request.user)

        # input validation for user
        if form1.is_valid():
            # update the user, user profile, and mobile information.
            request.user.first_name = request.POST['first_name']
            request.user.last_name = request.POST['last_name']
            request.user.email = request.POST['email']
            request.user.save()

            msgNote = ['fileView']
            msgNote.append({'sign':'ok','msg':'Your profile has been successfully updated!'})
            request.session['msgNote'] = msgNote
            return HttpResponseRedirect(reverse('fileView'))
    else:
        # prepopulate the form with user information
        form1 = UpdateUserInfoForm(initial={
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'contact_num': request.user.contact_num,
            'company': request.user.company,

        })
 
    # Define header groups
    hgrps = ({'name':'Personal Information','lblwidth':'160'},)

    # For first header group
    form1.fields["email"].widget.attrs['hgrp'] = '0'
    form1.fields["email"].widget.attrs['wsize'] = '300'
    form1.fields["first_name"].widget.attrs['hgrp'] = '0'
    form1.fields["first_name"].widget.attrs['wsize'] = '300'
    form1.fields["last_name"].widget.attrs['hgrp'] = '0'
    form1.fields["last_name"].widget.attrs['wsize'] = '300'
    form1.fields["contact_num"].widget.attrs['hgrp'] = '0'
    form1.fields["contact_num"].widget.attrs['wsize'] = '300'
    form1.fields["company"].widget.attrs['hgrp'] = '0'
    form1.fields["company"].widget.attrs['wsize'] = '300'

    return render(request, 'main/editprofile.html', {'otherVars':otherVars, 'form1': form1, 'hgrps':hgrps,'userArr':allFields})

#################################################################################################################################
# view page for changing account password
@login_active_required(login_url=reverse_lazy('login'))

def changePassword(request):

    otherVars = {}
    otherVars['pageType'] = 'logon'
    otherVars['UserInfo'] = request.user.first_name + ' ' + request.user.last_name
    if request.method == 'POST':
        form1 = ChangePasswordForm(request.user, request.POST)
        # input validation for change password
        if form1.is_valid():
            # update the user information
            form1.save()
            request.session['msgNote'] = ['fileView',{'sign':'ok','msg':'Your password has been updated successfully!'}]
            return HttpResponseRedirect(reverse('fileView'))
    else:
        form1 = ChangePasswordForm(request.user)

    # Define header groups
    hgrps = ({'name':'Change Password','lblwidth':'160'},)
    # For first header group
    form1.fields["oldPwd"].widget.attrs['hgrp'] = '0'
    form1.fields["oldPwd"].widget.attrs['wsize'] = '300'
    form1.fields["newPwd"].widget.attrs['hgrp'] = '0'
    form1.fields["newPwd"].widget.attrs['wsize'] = '300'
    form1.fields["cfmPwd"].widget.attrs['hgrp'] = '0'
    form1.fields["cfmPwd"].widget.attrs['wsize'] = '300'

    return render(request, 'main/chgpasswd.html', {'otherVars':otherVars,'form1' : form1,'hgrps':hgrps})


@login_active_required(login_url=reverse_lazy('login'))
def friendView(request):
    otherVars = {}
    otherVars['pageType'] = 'logon'
    otherVars['UserInfo'] = request.user.first_name + ' ' + request.user.last_name
    numOfRecords = RegisterUser.objects.filter(~Q(id=request.user.pk)).count()
    fileObjects =  RegisterUser.objects.filter(~Q(id=request.user.pk)).order_by('first_name')[:10]
    friendList = []

    for fileObj in fileObjects:
        check = ''
        if request.user.follows.filter(id=fileObj.pk):
            check = '<span class=\'fa fa-minus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/friends/del/%s\'\"><b>&nbsp;Remove User</b></span>'%fileObj.email

        else:
            check = '<span class=\'fa fa-plus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/friends/add/%s\'\"><b>&nbsp;Add User</b></span>'%fileObj.email

        friendList.append([
            fileObj.first_name + " " + fileObj.last_name,
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
    # Message to display when table has no records
    tabEmptyMsg = 'No friends available for viewing'
    return render(request, 'main/friendview.html', {'otherVars':otherVars, 'tableInfo':tableInfo,'tabEmptyMsg':tabEmptyMsg})

@login_active_required(login_url=reverse_lazy('login'))
def friendViewUpdate(request):
    otherVars = {}
    if request.method == 'POST':
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
                    tSearchArr = [('name__icontains', sItem['searchTerm'])]
            for item in [Q(x) for x in tSearchArr]:
                query |= item
        if query:
            numOfRecords = RegisterUser.filter(query).count()
        else:
            numOfRecords = RegisterUser.objects.filter(~Q(id=request.user.pk)).count()

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
            fileObjects =  RegisterUser.objects.filter(~Q(id=request.user.pk)).filter(query).order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1]
        else:
            fileObjects =  RegisterUser.objects.filter(~Q(id=request.user.pk)).order_by(*sortOrder)[recordStart-1:recordStart+pageLength-1]
        listLength = len(fileObjects)
        friendList = []
        for fileObj in fileObjects:
            check = ''
            if request.user.follows.filter(id=fileObj.pk):
                check = '<span class=\'fa fa-minus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/friends/del/%s\'\"><b>&nbsp;Remove User</b></span>'%fileObj.email

            else:
                check = '<span class=\'fa fa-plus\' style="cursor:pointer;" onclick=\"javascript:window.location.href=\'/main/friends/add/%s\'\"><b>&nbsp;Add User</b></span>'%fileObj.email

            friendList.append([
            fileObj.first_name + " " + fileObj.last_name,
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
        return friendView(request)

@login_active_required(login_url=reverse_lazy('login'))
def addFriend(request, email=None):
    if not email == None:
        obj = RegisterUser.objects.get(username=email)
        request.user.follows.add(obj)
        request.user.save()

        return HttpResponseRedirect(reverse('friendView'))

@login_active_required(login_url=reverse_lazy('login'))
def delFriend(request, email=None):
    if not email == None:
        obj = RegisterUser.objects.get(username=email)
        request.user.follows.remove(obj)
        request.user.save()

        return HttpResponseRedirect(reverse('friendView'))

