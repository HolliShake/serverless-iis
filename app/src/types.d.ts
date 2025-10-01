declare module 'react' {
  interface CSSProperties {
    [key: `--${string}`]: string | number;
  }
}

export type Route = {
  key: string;
  title: string;
  path: string;
  component: React.ReactNode;
  children?: Route[];
  sidebar?: boolean;
  icon?: React.ReactNode;
  layout: 'sidebar' | 'default';
  children: Route[];
};

export interface Website {
  name: string;
  id: number;
  state: 'Started' | 'Stopped';
  physicalPath: string;
  bindings: Binding;
}

export interface Binding {
  protocol: string;
  port: number;
  host: string;
  ssl: boolean;
}

export interface WebsiteRequest {
  name: string;
  protocol: string;
  hostOrDomain: string;
  port: number;
}

export interface MachineState {
  os: string;
  platform: string;
  platformFamily: string;
  platformVersion: string;
  kernelVersion: string;
  kernelArch: string;
  hostname: string;
  cpus: number;
  uptime: string;
  totalMemory: number;
  availableMemory: number;
  usedMemory: number;
  memoryUsage: number;
}
