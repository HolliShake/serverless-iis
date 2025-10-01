import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import ROUTES from '@/routing';
import type { Route } from '@/types';
import { Toaster } from 'react-hot-toast';

interface SidebarLayoutProps {
    children: React.ReactNode;
}

export default function SidebarLayout({ children }: SidebarLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = React.useState(false);
    const [expandedRoutes, setExpandedRoutes] = React.useState<Set<string>>(new Set());
    const location = useLocation();

    const sidebarRoutes = ROUTES.filter(route => route.sidebar);

    const isActiveRoute = (path: string) => {
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    const toggleExpanded = (routeKey: string) => {
        const newExpanded = new Set(expandedRoutes);
        if (newExpanded.has(routeKey)) {
            newExpanded.delete(routeKey);
        } else {
            newExpanded.add(routeKey);
        }
        setExpandedRoutes(newExpanded);
    };

    const renderRoute = (route: Route, level: number = 0) => {
        const hasChildren = route.children && route.children.length > 0;
        const isExpanded = expandedRoutes.has(route.key);
        const isActive = isActiveRoute(route.path);

        return (
            <li key={route.key}>
                {hasChildren ? (
                    <div>
                        <button
                            onClick={() => toggleExpanded(route.key)}
                            className={`
                                group flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out text-left
                                ${isActive
                                    ? 'bg-background text-foreground shadow-sm border-l-4 border-primary'
                                    : 'text-foreground hover:bg-muted hover:text-foreground hover:shadow-sm hover:translate-x-1 border-l-4 border-transparent'
                                }
                            `}
                            style={{ paddingLeft: `${16 + level * 16}px` }}
                        >
                            {route.icon && (
                                <span className={`
                                    mr-3 flex-shrink-0 transition-transform duration-200
                                    ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                                `}>
                                    {route.icon}
                                </span>
                            )}
                            <span className="truncate flex-1">{route.title}</span>
                            <span className="ml-2 transition-transform duration-200">
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </span>
                            {isActive && (
                                <span className="ml-2 w-2 h-2 bg-primary rounded-full opacity-75"></span>
                            )}
                        </button>
                        {isExpanded && (
                            <ul className="mt-1 space-y-1">
                                {route.children?.map((childRoute: Route) => renderRoute(childRoute, level + 1))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <Link
                        to={route.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                            group flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ease-in-out
                            ${isActive
                                ? 'bg-background text-foreground shadow-sm border-l-4 border-primary'
                                : 'text-foreground hover:bg-muted hover:text-foreground hover:shadow-sm hover:translate-x-1 border-l-4 border-transparent'
                            }
                        `}
                        style={{ paddingLeft: `${16 + level * 16}px` }}
                    >
                        {route.icon && (
                            <span className={`
                                mr-3 flex-shrink-0 transition-transform duration-200
                                ${isActive ? 'scale-110' : 'group-hover:scale-105'}
                            `}>
                                {route.icon}
                            </span>
                        )}
                        <span className="truncate">{route.title}</span>
                        {isActive && (
                            <span className="ml-auto w-2 h-2 bg-primary rounded-full opacity-75"></span>
                        )}
                    </Link>
                )}
            </li>
        );
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-surface transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex items-center justify-between h-16 px-6 border-b border-surface">
                    <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-md text-foreground hover:bg-background hover:text-background transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="mt-6 px-3">
                    <ul className="space-y-1">
                        {sidebarRoutes.map((route) => renderRoute(route))}
                    </ul>
                </nav>
            </div>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-surface border-b border-surface">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-md text-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold text-foreground">Admin Panel</h1>
                    <div className="w-9" /> {/* Spacer for centering */}
                </div>

                {/* Page content */}
                <main className="flex-1 overflow-auto p-6">
                    {children}
                    <Toaster 
                        position="top-right"
                        toastOptions={{
                            style: {
                                background: 'var(--bg-surface)',
                                color: 'var(--foreground)',
                                border: '1px solid var(--muted)',
                            },
                            success: {
                                style: {
                                    background: 'var(--bg-success)',
                                    color: 'var(--text-success)',
                                },
                            },
                            error: {
                                style: {
                                    background: 'var(--bg-error)',
                                    color: 'var(--text-error)',
                                },
                            },
                        }}
                    />
                </main>
            </div>
        </div>
    );
}
