from django import forms
from django.utils.safestring import mark_safe

class ImageDisplay(forms.Widget):
    def __init__(self, attrs=None):
        default_attrs = {'height': '250', 'width': '250'}
        if attrs:
            default_attrs.update(attrs)
        super(ImageDisplay, self).__init__(default_attrs)
        
    def render(self, name, value, attrs=None):
        if value is None: value = ''
        final_attrs = self.build_attrs(attrs, name=name)
        attrStr = ""
        for k,v in final_attrs.iteritems():
            print k,v
            if not attrStr == '':
                attrStr += ' '
            attrStr += str(k)+'="'+str(v)+'"'
            
        return mark_safe('<img %s src="%s"/>' % (attrStr, value))