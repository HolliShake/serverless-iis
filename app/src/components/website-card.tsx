import type { Website } from '@/types';
import { ExternalLink, Folder, Globe, Lock, Play, RotateCcw, Square, Trash } from 'lucide-react';
import Badge from './badge';
import Button from './button';
import Card from './card';

interface WebsiteCardProps {
  website: Website;
  onStart?: (website: Website) => void;
  onStop?: (website: Website) => void;
  onRestart?: (website: Website) => void;
  onDelete?: (website: Website) => void;
  onClick?: (website: Website) => void;
}

export default function WebsiteCard({
  website,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onClick,
}: WebsiteCardProps) {
  const getStatusVariant = (state: 'Started' | 'Stopped') => {
    switch (state) {
      case 'Started':
        return 'success';
      case 'Stopped':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatPath = (path: string) => {
    return path.length > 35 ? `...${path.slice(-32)}` : path;
  };

  const formatWebsiteName = (name: string) => {
    return name.length > 20 ? `${name.slice(0, 17)}...` : name;
  };

  const websiteUrl = `${website.bindings.protocol}://${website.bindings.host || 'localhost'}:${website.bindings.port}`;
  const isSecure = website.bindings.protocol.toLowerCase() === 'https' || website.bindings.ssl;

  return (
    <Card
      className="group relative hover:border-primary/50 cursor-pointer"
      onClick={onClick ? () => onClick(website) : undefined}
    >
      {/* Content */}
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                <Globe className="h-4 w-4 text-primary" />
              </div>
              <div className="space-y-1">
                <h3
                  className="text-lg font-semibold leading-none tracking-tight text-foreground truncate"
                  title={website.name}
                >
                  {formatWebsiteName(website.name)}
                </h3>
                <p className="text-sm text-muted-foreground">Site #{website.id}</p>
              </div>
            </div>

            {/* URL with click to open */}
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors duration-200 group/link"
            >
              <span className="truncate">{websiteUrl}</span>
              <ExternalLink className="h-3 w-3 opacity-0 group-hover/link:opacity-100 transition-opacity duration-200" />
            </a>
          </div>

          <div className="flex items-center gap-2 ml-4">
            {isSecure && (
              <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-success/10">
                <Lock className="h-3 w-3 text-success" />
              </div>
            )}
            <Badge variant={getStatusVariant(website.state)} appearance="soft">
              <div
                className={`h-2 w-2 rounded-full mr-2 ${
                  website.state === 'Started' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
              />
              {website.state}
            </Badge>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-md border border-muted bg-background/50 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-muted">
              <Folder className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Physical Path</p>
              <p
                className="text-sm font-mono text-foreground truncate"
                title={website.physicalPath}
              >
                {formatPath(website.physicalPath)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          {website.state === 'Stopped' && onStart && (
            <Button
              variant="success"
              appearance="soft"
              size="sm"
              onClick={() => onStart(website)}
              className="h-8"
            >
              <Play className="h-3 w-3 mr-1.5" />
              Start
            </Button>
          )}

          {website.state === 'Started' && onStop && (
            <Button
              variant="error"
              appearance="soft"
              size="sm"
              onClick={() => onStop(website)}
              className="h-8"
            >
              <Square className="h-3 w-3 mr-1.5" />
              Stop
            </Button>
          )}

          {onRestart && (
            <Button
              variant="default"
              appearance="soft"
              size="sm"
              onClick={() => onRestart(website)}
              className="h-8"
            >
              <RotateCcw className="h-3 w-3 mr-1.5" />
              Restart
            </Button>
          )}

          <div className="flex-1" />

          {onDelete && (
            <Button variant="error" appearance="soft" size="icon" onClick={() => onDelete(website)}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
