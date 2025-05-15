from django import forms
from .models import Directory, File

class FileUploadForm(forms.ModelForm):
    """Form för att ladda upp PDF-filer till en mapp"""
    
    class Meta:
        model = File
        fields = ['name', 'file', 'description']
    
    def __init__(self, *args, **kwargs):
        self.directory = kwargs.pop('directory', None)
        self.uploaded_by = kwargs.pop('uploaded_by', None)
        self.project = kwargs.pop('project', None)
        super(FileUploadForm, self).__init__(*args, **kwargs)
    
    def clean_file(self):
        """Validera att filen är en PDF"""
        file = self.cleaned_data.get('file')
        if file:
            if not file.name.endswith('.pdf'):
                raise forms.ValidationError('Endast PDF-filer är tillåtna.')
            
            # Kontrollera filstorlek, max 20MB
            if file.size > 20 * 1024 * 1024:  # 20 MB
                raise forms.ValidationError('Filstorleken får inte överstiga 20 MB.')
        return file
    
    def save(self, commit=True):
        """Sätt automatisvärden på filen före sparing"""
        instance = super(FileUploadForm, self).save(commit=False)
        instance.directory = self.directory
        instance.uploaded_by = self.uploaded_by
        instance.project = self.project
        instance.content_type = 'application/pdf'
        instance.size = instance.file.size
        
        if commit:
            instance.save()
        return instance


class DirectoryPageForm(forms.ModelForm):
    """Form för att redigera mappens sida (titel och beskrivning)"""
    
    class Meta:
        model = Directory
        fields = ['page_title', 'page_description']