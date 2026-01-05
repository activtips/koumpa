'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChatPanel } from '@/components/features/workspace/chat-panel';
import { PreviewPanel } from '@/components/features/workspace/preview-panel';
import { WorkspaceHeader } from '@/components/features/workspace/workspace-header';
import { useAuth } from '@/lib/auth/auth-context';
import { projectsApi } from '@/lib/api/projects';
import type { Project } from '@/types';
import { Loader2 } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  // Fetch project data
  useEffect(() => {
    if (!projectId || !isAuthenticated) return;

    const fetchProject = async () => {
      try {
        setIsLoading(true);
        const projectData = await projectsApi.get(projectId);
        setProject(projectData);

        // Add initial message from project description
        if (projectData.description) {
          setMessages([
            {
              id: '1',
              role: 'user',
              content: projectData.description,
              timestamp: new Date(projectData.createdAt),
            },
            {
              id: '2',
              role: 'assistant',
              content: `J'ai commencé à générer votre application "${projectData.name}". ${
                projectData.status === 'deployed'
                  ? 'Elle est maintenant déployée!'
                  : projectData.status === 'generating'
                  ? 'La génération est en cours...'
                  : projectData.status === 'failed'
                  ? 'Une erreur est survenue lors de la génération.'
                  : 'En attente de traitement...'
              }`,
              timestamp: new Date(projectData.createdAt),
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to fetch project:', err);
        setError('Impossible de charger le projet');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, isAuthenticated]);

  // Poll for status updates
  useEffect(() => {
    if (!project || project.status === 'deployed' || project.status === 'failed') {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        const updatedProject = await projectsApi.get(projectId);
        setProject(updatedProject);

        if (updatedProject.status === 'deployed') {
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: 'assistant',
              content: `Votre application est prête! Elle est accessible à l'adresse: https://${updatedProject.subdomain}.staging.koumpa.com`,
              timestamp: new Date(),
            },
          ]);
        }
      } catch (err) {
        console.error('Failed to poll project status:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [project, projectId]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isGenerating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);

    try {
      // TODO: Implement modification API
      // For now, simulate a response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Je comprends votre demande: "${content}". Cette fonctionnalité de modification sera bientôt disponible. Pour l'instant, vous pouvez voir l'aperçu de votre application à droite.`,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Erreur lors de l\'envoi du message');
    } finally {
      setIsGenerating(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500 mx-auto mb-4" />
          <p className="text-dark-400">Chargement du projet...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="text-primary-400 hover:text-primary-300"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <WorkspaceHeader project={project} />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Chat */}
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isGenerating={isGenerating}
          projectStatus={project?.status}
        />

        {/* Right Panel - Preview */}
        <PreviewPanel
          subdomain={project?.subdomain}
          status={project?.status}
        />
      </div>
    </div>
  );
}
