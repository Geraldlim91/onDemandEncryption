"""
Django settings for onDemandEncryption project.

For more information on this file, see
https://docs.djangoproject.com/en/1.6/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/1.6/ref/settings/
"""

# Build paths inside the project like this: os.path.join(BASE_DIR, ...)

import os
from django.conf import global_settings

BASE_DIR = os.path.dirname(os.path.dirname(__file__))


# Database
# https://docs.djangoproject.com/en/1.6/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': 'db.sqlite3',
        }
}

NEO4J_DATABASES = {
    'default' : {
        'HOST':'192.168.0.14',
        'PORT':7474,
        'ENDPOINT':'/db/data'
    }
}

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/1.6/howto/deployment/checklist/
TEMPLATE_CONTEXT_PROCESSORS = global_settings.TEMPLATE_CONTEXT_PROCESSORS + (
    "django.core.context_processors.request",
)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = '9v)ccw-s04j&_uil^u$yvl4z@()fqfjlv)n%se7y%@*@biu0g2'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

TEMPLATE_DEBUG = True

ALLOWED_HOSTS = ['*']


# Application definition

INSTALLED_APPS = (
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'neo4django.graph_auth',
    'widget_tweaks',
    'register',
    'profile',
    'login',
    'file',
    'jfu',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

# SESSION_ENGINE = 'django.contrib.sessions.backends.file'

AUTH_USER_MODEL = 'register.RegisterUser'

ROOT_URLCONF = 'urls'

WSGI_APPLICATION = 'wsgi.application'

DATABASE_ROUTERS = ['neo4django.utils.Neo4djangoIntegrationRouter']

AUTHENTICATION_BACKENDS = ('neo4django.graph_auth.backends.NodeModelBackend',)

# Internationalization
# https://docs.djangoproject.com/en/1.6/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'Asia/Singapore'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.6/howto/static-files/

STATIC_URL = '/static/'

STATICFILES_DIRS = (
    os.path.join(os.path.abspath(os.path.join(os.path.realpath(__file__), os.path.pardir, os.path.pardir)), 'res/drawable'),
    # os.path.join("C:\Users\Gerald\Desktop\onDemandEncrypt" +  "\\res\drawable"),
    # os.path.join("C:\Users\Gerald\Dropbox\Dar Dar Shared Folder\MP\Winnie backup project\onDemandEncrypt" +  "\\res\drawable"),

    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

TEMPLATE_DIRS = (
    os.path.join(os.path.abspath(os.path.join(os.path.realpath(__file__), os.path.pardir, os.path.pardir)), 'res/template'),
    # os.path.join("C:\Users\Gerald\Desktop\onDemandEncrypt" + "\\res" + "\\template"),

    # os.path.join("C:\Users\Gerald\Dropbox\Dar Dar Shared Folder\MP\Winnie backup project\onDemandEncrypt" + "\\res" + "\\template"),
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

 # SESSION_COOKIE_SECURE = True
 # CSRF_COOKIE_SECURE = True
