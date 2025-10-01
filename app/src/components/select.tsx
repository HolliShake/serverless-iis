import React from 'react';

export interface SelectItem {
    label: string;
    value: number | string;
}

export interface SelectProps {
    items: SelectItem[];
    value?: number | string;
    onChange?: (value: number | string) => void;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ items, value, onChange, placeholder, disabled, className, ...props }, ref) => {
        const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
            const selectedValue = event.target.value;
            // Convert to number if the original value was a number
            const item = items.find(item => item.value.toString() === selectedValue);
            if (item && onChange) {
                onChange(item.value);
            }
        };

        return (
            <div className="relative">
                <select
                    ref={ref}
                    value={value?.toString() || ''}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`flex h-10 w-full rounded-lg border border-input bg-background pl-3 pr-10 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none ${className || ""}`}
                    {...props}
                >
                    {placeholder && (
                        <option value="" disabled>
                            {placeholder}
                        </option>
                    )}
                    {items.map((item) => (
                        <option key={item.value} value={item.value.toString()}>
                            {item.label}
                        </option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';

export default Select;
