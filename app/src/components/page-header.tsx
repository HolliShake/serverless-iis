import { ChevronsRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export interface PageHeaderProps {
  title: string;
  description: string;
  breadcrumbs?: BreadCrumbsItem[];
}

export interface BreadCrumbsItem {
  name: string;
  href: string;
  active: boolean;
}

export default function PageHeader({ title, description, breadcrumbs = [] }: PageHeaderProps) {
  const location = useLocation();

  // Generate breadcrumbs from current location if none provided
  const defaultBreadcrumbs =
    breadcrumbs.length === 0
      ? location.pathname
          .split('/')
          .filter((segment) => segment !== '')
          .map((segment, index, array) => ({
            name: segment.charAt(0).toUpperCase() + segment.slice(1),
            href: '/' + array.slice(0, index + 1).join('/'),
            active: index === array.length - 1,
          }))
      : breadcrumbs;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold text-background mb-2">{title}</h1>
          <p className="text-background opacity-70">{description}</p>
        </div>
        <div className="bg-surface border border-surface rounded-lg px-4 py-2 shadow-sm">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="inline-flex items-center gap-1">
              {defaultBreadcrumbs.map((item, index) => (
                <li key={index} className="inline-flex items-center">
                  {index > 0 && (
                    <ChevronsRight className="w-3 h-3 text-background opacity-50 mx-1" />
                  )}
                  {item.active ? (
                    <span className="text-sm font-medium text-background opacity-70">
                      {item.name}
                    </span>
                  ) : (
                    <a
                      href={item.href}
                      className="text-sm font-medium text-blue-400 hover:text-blue-300"
                    >
                      {item.name}
                    </a>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>
    </div>
  );
}
