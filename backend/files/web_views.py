from django.shortcuts import render, get_object_or_404, redirect
from django.views.generic import ListView, DetailView, CreateView, UpdateView, DeleteView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.urls import reverse_lazy, reverse
from django.contrib import messages
from django.http import HttpResponseForbidden, Http404
from .models import Directory, File
from .forms import FileUploadForm, DirectoryPageForm
from core.models import Project, RoleAccess


class DirectoryPageView(DetailView):
    """Vy för att visa en specifik mappens sida med dess PDF-filer"""
    model = Directory
    template_name = 'files/directory_page.html'
    context_object_name = 'directory'
    slug_url_kwarg = 'slug'
    
    def get_object(self, queryset=None):
        """Hämta mappen baserat på slug"""
        slug = self.kwargs.get(self.slug_url_kwarg)
        directory = get_object_or_404(Directory, slug=slug, has_page=True)
        return directory
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directory = self.object
        
        # Hämta alla PDF-filer i denna mapp
        pdf_files = directory.get_pdf_files()
        context['pdf_files'] = pdf_files
        
        # Form för filuppladdning
        context['upload_form'] = FileUploadForm()
        
        # Form för att redigera mappens sida
        context['edit_form'] = DirectoryPageForm(instance=directory)
        
        # Hämta undermappar för navigering
        context['subdirectories'] = Directory.objects.filter(
            parent=directory, 
            has_page=True
        ).order_by('name')
        
        return context


from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator

@method_decorator(csrf_protect, name='dispatch')
class UploadPDFView(LoginRequiredMixin, CreateView):
    """Vy för att ladda upp PDF-filer till en mapp"""
    model = File
    form_class = FileUploadForm
    template_name = 'files/upload_file.html'
    
    def get_form_kwargs(self):
        kwargs = super().get_form_kwargs()
        # Hämta mappen baserat på slug
        directory_slug = self.kwargs.get('slug')
        directory = get_object_or_404(Directory, slug=directory_slug)
        
        kwargs['directory'] = directory
        kwargs['uploaded_by'] = self.request.user
        
        # Om mappen är knuten till ett projekt, använd det
        kwargs['project'] = directory.project
        
        # Spåra vilken mapp det handlar om i loggen
        print(f"Förbereder uppladdning till mapp: {directory_slug}, directory ID: {directory.id}")
        
        return kwargs
    
    def form_valid(self, form):
        """Anpassa återriktning efter uppladdning"""
        response = super().form_valid(form)
        print(f"Uppladdning lyckades för fil: {form.instance.name} till mapp ID: {form.instance.directory.id}")
        messages.success(self.request, f"Filen '{form.instance.name}' har laddats upp.")
        return redirect('directory_page', slug=self.kwargs.get('slug'))
        
    def post(self, request, *args, **kwargs):
        print(f"Hanterar POST-anrop för filuppladdning till slug: {kwargs.get('slug', 'okänd')}")
        print(f"POST innehåller CSRF-token: {'X-CSRFToken' in request.headers}")
        try:
            return super().post(request, *args, **kwargs)
        except Exception as e:
            print(f"Fel vid filuppladdning: {e}")
            raise
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        directory_slug = self.kwargs.get('slug')
        directory = get_object_or_404(Directory, slug=directory_slug)
        context['directory'] = directory
        return context


class UpdateDirectoryPageView(LoginRequiredMixin, UpdateView):
    """Vy för att uppdatera mappens sidinformation"""
    model = Directory
    form_class = DirectoryPageForm
    template_name = 'files/edit_directory_page.html'
    
    def get_success_url(self):
        return reverse('directory_page', kwargs={'slug': self.object.slug})
    
    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, "Mappsidan har uppdaterats.")
        return response


class DirectoryListView(ListView):
    """Vy för att visa alla mappar som har sidor"""
    model = Directory
    template_name = 'files/directory_list.html'
    context_object_name = 'directories'
    
    def get_queryset(self):
        """Returnera endast mappar som har sidor"""
        return Directory.objects.filter(has_page=True).order_by('name')