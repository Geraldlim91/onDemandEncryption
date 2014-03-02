from django.shortcuts import render
from django.contrib import auth
from django.contrib.auth import logout as auth_logout
from django.http import HttpResponseRedirect
from django.core.urlresolvers import resolve,reverse,reverse_lazy
from forms import LoginForm, ResetForm
from decorator import login_active_required
from datetime import datetime, timedelta
from django.utils.timezone import utc
# Create your views here.
def login(request):
    otherVars = {}
#     print resolve(request.path_info).url_name
    otherVars['pageType'] = 'login'
    if request.user.is_authenticated():
        return HttpResponseRedirect(reverse('fileView'))

    # If the form has been submitted...
    if request.method == 'POST':
        if '_login' in request.POST:
            # A form bound to the POST data
            formLogin = LoginForm(None, request.POST)
            formReset = ResetForm()
            # input validation for login form
            if formLogin.is_valid():

                auth.login(request, formLogin.get_user())
                if request.session.test_cookie_worked():
                    request.session.delete_test_cookie()
                if formLogin.cleaned_data['rememberuser'] == True:
                    request.session.set_expiry(datetime.utcnow().replace(tzinfo=utc) + timedelta(days=10))
                else:
                    request.session.set_expiry(0)

                return HttpResponseRedirect(reverse('fileView'))
            otherVars['loginActive'] = 'Y'

        if '_reset' in request.POST:
            formReset = ResetForm(request.POST)
            formLogin = LoginForm()
    else:
        # An unbound form
        formLogin = LoginForm(request)
        formReset = ResetForm()
        otherVars['loginActive'] = 'Y'

    request.session.set_test_cookie()
    return render(request, 'main/login.html', {
        'formLogin': formLogin,
        'formReset': formReset,
        'otherVars': otherVars,
        })

@login_active_required(login_url = reverse_lazy('login'))
# view page for logout form
def logout(request):

    # logout the user and clear session cookie
    auth_logout(request)
    return HttpResponseRedirect(reverse('login'))


