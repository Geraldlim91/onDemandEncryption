from django import forms
from django.forms import ModelForm
from models import RegisterUser
import re


class registerForm(forms.Form):
    # username = forms.CharField(max_length=32)
    email = forms.CharField(max_length=50)
    password = forms.CharField(label=("Password"), widget=forms.PasswordInput, help_text= "Password must be at least 8 characters long,</br>and contain at least 1 upper-case letter, 1 lower-case letter and 1 numeric digit")
    confirm_password = forms.CharField(label=(u'Confirm password'),widget=forms.PasswordInput(render_value = False),help_text="Retype the password")
    first_name = forms.CharField(max_length=30)
    last_name = forms.CharField(max_length=30)
    contact_num = forms.CharField(max_length=8, required=False,widget=forms.TextInput(attrs={'placeholder': 'Optional'}))
    company = forms.CharField(max_length=100,required=False,widget=forms.TextInput(attrs={'placeholder': 'Optional'}))

    #Validation for email field
    def clean_email(self):
        email = self.cleaned_data.get('email', '')

        if len(email) == 0:
            raise forms.ValidationError("This field is required.")
        if re.search("^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$", email ,re.IGNORECASE) == None:
            raise forms.ValidationError("Email address is invalid")
        if RegisterUser.objects.filter(email = email).count() != 0:
            raise forms.ValidationError("A user have registered an account with this email.")


        return email

    #Validation for password field
    def clean_password(self):
        password = self.cleaned_data.get('password', '')

        if len(password) < 8:
            raise forms.ValidationError("Length of password must be at least 8 characters")
        if re.search("^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,%d}$" % int(len(password)),password) == None:
            raise forms.ValidationError("Password must contain 1 uppercase, 1 lowercase and 1 numeric digit")

        return password

    #Validation for confirm password field
    def clean_confirm_password(self):
        password = self.cleaned_data.get('password', '')
        cfm_password = self.cleaned_data.get('confirm_password', '')

        if cfm_password != password:
            raise forms.ValidationError("Sorry, passwords do not match")

        return cfm_password

    #Validate for first name field
    def clean_first_name(self):
        first_name = self.cleaned_data.get('first_name', '')

        if len(first_name) == 0:
            raise forms.ValidationError("This field is required.")

        return first_name

    #Validation for last name field
    def clean_last_name(self):
        last_name = self.cleaned_data.get('last_name', '')

        if len(last_name) == 0:
            raise forms.ValidationError("This field is required.")

        return last_name
