import Button from '@/components/button';
import Dialog, { useDialogController } from '@/components/dialog';
import Input from '@/components/input';
import Select from '@/components/select';
import { useMutate } from '@/hooks/query';
import { KEY } from '@/routing/navigation';
import WebsiteService from '@/services/websites';
import type { Website, WebsiteRequest } from '@/types';
import { extractError } from '@/util/error';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

export interface WebsiteModalData {
  website?: Website;
  mode: 'create' | 'edit';
}

const websiteFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Website name is required')
    .refine((value) => !/\s/.test(value), 'Website name cannot contain spaces'),
  protocol: z.string().min(1, 'Protocol is required'),
  hostOrDomain: z.string().min(1, 'Host or domain is required'),
  port: z.number().min(1, 'Port must be at least 1').max(65535, 'Port must be at most 65535'),
});

export type WebsiteFormData = z.infer<typeof websiteFormSchema>;

interface WebsiteModalProps {
  controller: ReturnType<typeof useDialogController<WebsiteModalData>>;
  onSubmit?: (data: WebsiteFormData) => void;
  isLoading?: boolean;
}

const protocolOptions = [
  { label: 'HTTP', value: 'http' },
  { label: 'HTTPS', value: 'https' },
  { label: 'UDP', value: 'udp' },
  { label: 'TCP', value: 'tcp' },
  { label: 'FTP', value: 'ftp' },
];

export default function WebsiteModal({
  controller,
  onSubmit,
  isLoading = false,
}: WebsiteModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WebsiteFormData>({
    resolver: zodResolver(websiteFormSchema),
    defaultValues: {
      name: '',
      protocol: 'http',
      hostOrDomain: '',
      port: 80,
    },
  });

  const location = useLocation();
  const navigate = useNavigate();

  const { mutate: create, isLoading: isCreating } = useMutate<Website, WebsiteRequest>({
    callback: async (site: WebsiteRequest) => await WebsiteService.createWebsite(site),
  });

  const { mutate: update, isLoading: isUpdating } = useMutate<
    Website,
    { original: string; site: WebsiteRequest }
  >({
    callback: async ({ original, site }: { original: string; site: WebsiteRequest }) =>
      await WebsiteService.updateWebsite(original, site),
  });

  const isEditMode = controller.data?.mode === 'edit';
  const isFormLoading = isLoading || isCreating || isUpdating;
  const protocolValue = watch('protocol');

  // Reset form when modal opens with new data
  useEffect(() => {
    if (controller.visible && controller.data?.website) {
      reset({
        name: controller.data.website.name || '',
        protocol: controller.data.website.bindings.protocol || 'http',
        hostOrDomain: controller.data.website.bindings.host || '',
        port: controller.data.website.bindings.port || 80,
      });
    } else if (controller.visible) {
      reset({
        name: '',
        protocol: 'http',
        hostOrDomain: '',
        port: 80,
      });
    }
  }, [controller.visible, controller.data, reset]);

  const handleFormSubmit = async (data: WebsiteFormData) => {
    try {
      if (isEditMode) {
        await update({
          original: controller.data?.website?.name || '',
          site: data,
        });
        const prevName = controller.data?.website?.name || '';
        if (KEY.ViewWebsite.parse!(prevName) == location.pathname && prevName != data.name) {
          navigate(KEY.ViewWebsite.parse!(data.name));
        }
      } else {
        await create(data);
      }
      onSubmit?.(data);
      controller.onClose();
      reset();
      toast.success('Saved successfully!');
    } catch (error) {
      toast.error(extractError(error));
    }
  };

  const handleClose = () => {
    controller.onClose();
    reset();
  };

  const handleProtocolChange = (value: string | number) => {
    setValue('protocol', String(value));
  };

  return (
    <Dialog
      controller={controller}
      title={isEditMode ? 'Edit Website' : 'Create New Website'}
      className="max-w-lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
            Website Name
          </label>
          <Input
            id="name"
            type="text"
            {...register('name')}
            placeholder="Enter website name (no spaces)"
            disabled={isFormLoading}
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="hostOrDomain" className="block text-sm font-medium text-foreground mb-2">
            Host or Domain
          </label>
          <Input
            id="hostOrDomain"
            type="text"
            {...register('hostOrDomain')}
            placeholder="localhost or example.com"
            disabled={isFormLoading}
          />
          {errors.hostOrDomain && (
            <p className="mt-1 text-sm text-red-500">{errors.hostOrDomain.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="port" className="block text-sm font-medium text-foreground mb-2">
              Port
            </label>
            <Input
              id="port"
              type="number"
              {...register('port', { valueAsNumber: true })}
              placeholder="80"
              min="1"
              max="65535"
              disabled={isFormLoading}
            />
            {errors.port && <p className="mt-1 text-sm text-red-500">{errors.port.message}</p>}
          </div>

          <div>
            <label htmlFor="protocol" className="block text-sm font-medium text-foreground mb-2">
              Protocol
            </label>
            <Select
              items={protocolOptions}
              value={protocolValue}
              onChange={handleProtocolChange}
              placeholder="Select protocol"
              disabled={isFormLoading}
            />
            {errors.protocol && (
              <p className="mt-1 text-sm text-red-500">{errors.protocol.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" onClick={handleClose} disabled={isFormLoading} className="bg-error">
            Cancel
          </Button>
          <Button type="submit" disabled={isFormLoading}>
            {isFormLoading ? 'Saving...' : isEditMode ? 'Update Website' : 'Create Website'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
