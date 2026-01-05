'use client';

import { useState } from 'react';
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Loader2,
  ExternalLink,
  Code,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { ProjectStatus } from '@/types';

interface PreviewPanelProps {
  deployUrl?: string;
  status?: ProjectStatus;
}

type ViewMode = 'preview' | 'code';
type DeviceMode = 'desktop' | 'tablet' | 'mobile';

const deviceSizes: Record<DeviceMode, { width: string; height: string }> = {
  desktop: { width: '100%', height: '100%' },
  tablet: { width: '768px', height: '1024px' },
  mobile: { width: '375px', height: '667px' },
};

export function PreviewPanel({ deployUrl, status }: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const previewUrl = deployUrl || null;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setIframeKey((prev) => prev + 1);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderLoadingState = () => (
    <div className="flex-1 flex items-center justify-center bg-dark-850">
      <div className="text-center">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
          </div>
          <div className="absolute inset-0 rounded-full border-4 border-primary-500/20 animate-ping" />
        </div>
        <h3 className="text-xl font-medium text-dark-50 mb-2">
          Generation en cours...
        </h3>
        <p className="text-dark-400 max-w-sm">
          Notre IA cree votre application. Cela peut prendre quelques instants.
        </p>
      </div>
    </div>
  );

  const renderFailedState = () => (
    <div className="flex-1 flex items-center justify-center bg-dark-850">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">😕</span>
        </div>
        <h3 className="text-xl font-medium text-dark-50 mb-2">
          Echec de la generation
        </h3>
        <p className="text-dark-400 max-w-sm mb-4">
          Une erreur est survenue lors de la generation. Veuillez reessayer.
        </p>
        <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
          Reessayer
        </button>
      </div>
    </div>
  );

  const renderPendingState = () => (
    <div className="flex-1 flex items-center justify-center bg-dark-850">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6">
          <Monitor className="w-10 h-10 text-dark-400" />
        </div>
        <h3 className="text-xl font-medium text-dark-50 mb-2">
          En attente
        </h3>
        <p className="text-dark-400 max-w-sm">
          L'apercu apparaitra ici une fois la generation terminee.
        </p>
      </div>
    </div>
  );

  const renderPreview = () => {
    if (status === 'generating') return renderLoadingState();
    if (status === 'failed') return renderFailedState();
    if (status === 'pending' || !previewUrl) return renderPendingState();

    return (
      <div className="flex-1 flex items-center justify-center bg-dark-850 p-4 overflow-auto">
        <div
          className={cn(
            'bg-white rounded-lg overflow-hidden shadow-2xl transition-all duration-300',
            deviceMode === 'desktop' && 'w-full h-full',
            deviceMode !== 'desktop' && 'border border-dark-600'
          )}
          style={deviceMode !== 'desktop' ? deviceSizes[deviceMode] : undefined}
        >
          <iframe
            key={iframeKey}
            src={previewUrl}
            className="w-full h-full border-0"
            title="App Preview"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    );
  };

  const renderCodeView = () => (
    <div className="flex-1 flex items-center justify-center bg-dark-850">
      <div className="text-center">
        <div className="w-20 h-20 rounded-full bg-dark-700 flex items-center justify-center mx-auto mb-6">
          <Code className="w-10 h-10 text-dark-400" />
        </div>
        <h3 className="text-xl font-medium text-dark-50 mb-2">
          Vue code
        </h3>
        <p className="text-dark-400 max-w-sm">
          La vue code sera bientot disponible.
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col bg-dark-900">
      {/* Toolbar */}
      <div className="h-12 bg-dark-800 border-b border-dark-700 flex items-center justify-between px-4">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-dark-850 rounded-lg p-1">
          <button
            onClick={() => setViewMode('preview')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
              viewMode === 'preview'
                ? 'bg-dark-700 text-dark-50'
                : 'text-dark-400 hover:text-dark-200'
            )}
          >
            <Eye className="w-4 h-4" />
            Apercu
          </button>
          <button
            onClick={() => setViewMode('code')}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors',
              viewMode === 'code'
                ? 'bg-dark-700 text-dark-50'
                : 'text-dark-400 hover:text-dark-200'
            )}
          >
            <Code className="w-4 h-4" />
            Code
          </button>
        </div>

        {/* Device mode toggle */}
        {viewMode === 'preview' && status === 'deployed' && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setDeviceMode('desktop')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                deviceMode === 'desktop'
                  ? 'bg-dark-700 text-dark-50'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'
              )}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                deviceMode === 'tablet'
                  ? 'bg-dark-700 text-dark-50'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'
              )}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              className={cn(
                'p-2 rounded-lg transition-colors',
                deviceMode === 'mobile'
                  ? 'bg-dark-700 text-dark-50'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700'
              )}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          {previewUrl && status === 'deployed' && (
            <>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50"
                title="Rafraichir"
              >
                <RefreshCw
                  className={cn('w-4 h-4', isRefreshing && 'animate-spin')}
                />
              </button>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-dark-400 hover:text-dark-200 hover:bg-dark-700 rounded-lg transition-colors"
                title="Ouvrir dans un nouvel onglet"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {viewMode === 'preview' ? renderPreview() : renderCodeView()}
    </div>
  );
}
