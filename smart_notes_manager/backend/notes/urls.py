from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, summarize_note

router = DefaultRouter()
router.register('notes', NoteViewSet, basename='notes')

urlpatterns = [
    path('', include(router.urls)),
    path('notes/<int:pk>/summarize/', summarize_note, name='summarize-note'),
]
