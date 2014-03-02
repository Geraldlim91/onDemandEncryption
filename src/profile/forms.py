from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.utils.html import mark_safe
import re
from register.models import RegisterUser
import os

# Update user information form
class UpdateUserInfoForm(ModelForm):
    # email = forms.CharField(max_length=50)
    # first_name = forms.CharField(max_length=30)
    # last_name = forms.CharField(max_length=30)
    # contact_num = forms.CharField(max_length=8, required=False, widget=forms.TextInput(attrs={'placeholder': 'Optional'}))
    # company = forms.CharField(max_length=100,required=False,widget=forms.TextInput(attrs={'placeholder': 'Optional'}))

    class Meta:

        model = RegisterUser

        fields=('email','first_name','last_name','contact_num','company')
        widgets = {
            'email' : forms.TextInput(attrs={'readonly' : 'readonly'}),
            'contact_num' : forms.TextInput(attrs={'placeholder': 'Optional'}),
            'company' : forms.TextInput(attrs={'placeholder': 'Optional'}),
        }

    def clean_first_name(self):
        first_name = self.cleaned_data.get('first_name', '')

        if len(first_name) == 0:
            raise forms.ValidationError("This field is required.")

        return first_name

    def clean_last_name(self):
        last_name = self.cleaned_data.get('last_name', '')

        if len(last_name) == 0:
            raise forms.ValidationError("This field is required.")

        return last_name

    def clean_email(self):
        email = self.cleaned_data.get('email', '')

        if len(email) == 0:
            raise forms.ValidationError("This field is required.")
        if re.search("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$", email ,re.IGNORECASE) == None:
            raise forms.ValidationError("Email address is invalid")
    
        return email
    

# change password form
class ChangePasswordForm(forms.Form):
    
    oldPwd = forms.CharField(label=("Old password"), widget=forms.PasswordInput, help_text="Password used for current login")
    newPwd = forms.CharField(label=("New password"), widget=forms.PasswordInput, help_text= "Password must be at least 8 characters long,</br>and contain at least 1 upper-case letter, 1 lower-case letter and 1 numeric digit")
    cfmPwd = forms.CharField(label=("Confirm password"), widget=forms.PasswordInput, help_text="Retype the password")

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super(ChangePasswordForm, self).__init__(*args, **kwargs)

    def clean_oldPwd(self):
        oldPwd =self.cleaned_data.get('oldPwd', '')
        if not self.user.check_password(oldPwd):
            raise forms.ValidationError("Old password does not match")
        return oldPwd
    
    def clean_newPwd(self):
        oldPwd =self.cleaned_data.get('oldPwd', '')
        newPwd = self.cleaned_data.get('newPwd', '')
    
        if len(newPwd) < 8 :
            raise forms.ValidationError("Length of password must be at least 8 characters")
        if re.search("^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,%d}$" % int(len(newPwd)), newPwd) == None:
            raise forms.ValidationError("Password must contain 1 uppercase, 1 lowercase and 1 numeric digit")
        if newPwd == oldPwd:
            raise forms.ValidationError("Old and new password must not be the same")
        return newPwd
        
    def clean_cfmPwd(self):
        newPwd = self.cleaned_data.get('newPwd')
        cfmPwd = self.cleaned_data.get('cfmPwd')
        if newPwd and cfmPwd:
            if newPwd != cfmPwd:
                raise forms.ValidationError("Sorry, passwords do not match")

        return cfmPwd

    def save(self, commit=True):
        self.user.set_password(self.cleaned_data["newPwd"])
        if commit:
            self.user.save()
        return self.user
