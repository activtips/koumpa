'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ExternalLink, Settings, Share2 } from 'lucide-react';
import type { Project } from '@/types';
import { cn } from '@/lib/utils/cn';

interface WorkspaceHeaderProps {
  project: Project | null;
}

export function WorkspaceHeader({ project }: WorkspaceHeaderProps) {
  const router = useRouter();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'deployed':
        return 'bg-green-500';
      case 'generating':
        return 'bg-yellow-500 animate-pulse';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-dark-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'deployed':
        return 'Deploye';
      case 'generating':
        return 'Generation...';
      case 'failed':
        return 'Echec';
      default:
        return 'En attente';
    }
  };

  const previewUrl = project?.deployUrl || null;

  return (
    <header className="h-14 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-700 rounded-lg transition-colors"
          title="Retour"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="h-6 w-px bg-dark-700" />

        <div className="flex items-center gap-3">
          <h1 className="text-dark-50 font-medium truncate max-w-[200px]">
            {project?.name || 'Nouveau projet'}
          </h1>

          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full', getStatusColor(project?.status))} />
            <span className="text-sm text-dark-400">{getStatusText(project?.status)}</span>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {previewUrl && project?.status === 'deployed' && (
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-dark-300 hover:text-dark-50 hover:bg-dark-700 rounded-lg transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Ouvrir</span>
          </a>
        )}

        <button
          className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-700 rounded-lg transition-colors"
          title="Partager"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <button
          className="p-2 text-dark-400 hover:text-dark-50 hover:bg-dark-700 rounded-lg transition-colors"
          title="Parametres"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
