from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q
from .models import Note
from .serializers import NoteSerializer

class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Note.objects.filter(user=self.request.user).order_by('-updated_at')
        search = self.request.query_params.get('search')
        tag = self.request.query_params.get('tag')

        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(content__icontains=search))
        if tag:
            queryset = queryset.filter(tag__iexact=tag)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def summarize_note(request, pk):
    try:
        note = Note.objects.get(pk=pk, user=request.user)
    except Note.DoesNotExist:
        return Response({'error': 'Note not found'}, status=404)

    words = note.content.split()
    summary = ' '.join(words[:40])
    if len(words) > 40:
        summary += '...'

    return Response({'summary': summary})
