'use client';

import { Field as FormikField, ErrorMessage } from 'formik';

type Props = {
    field: {
        label: string;
        type: string;
        placeholder?: string;
        isRequired: boolean;
        options?: string[];
    };
};

export default function FieldRenderer({ field }: Props) {
    const { label, type, placeholder, isRequired, options } = field;

    return (
        <div>
            <label className="block mb-1 text-xs font-medium">
                {label} {isRequired && <span className="text-red-500">*</span>}
            </label>

            {type === 'textarea' ? (
                <FormikField
                    as="textarea"
                    name={label}
                    placeholder={placeholder || ''}
                    rows={3}
                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                />
            ) : type === 'select' ? (
                <FormikField
                    as="select"
                    name={label}
                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                >
                    <option value="">Select an option</option>
                    {options?.map((opt, i) => (
                        <option key={i} value={opt}>
                            {opt}
                        </option>
                    ))}
                </FormikField>
            ) : type === 'radio' ? (
                <div className="flex flex-wrap gap-2">
                    {options?.map((opt, i) => (
                        <label key={i} className="text-xs">
                            <FormikField type="radio" name={label} value={opt} className="mr-1" />
                            {opt}
                        </label>
                    ))}
                </div>
            ) : type === 'checkbox' ? (
                <div className="flex flex-wrap gap-2">
                    {options?.map((opt, i) => (
                        <label key={i} className="text-xs">
                            <FormikField type="checkbox" name={label} value={opt} className="mr-1" />
                            {opt}
                        </label>
                    ))}
                </div>
            ) : (
                <FormikField
                    name={label}
                    type={type}
                    placeholder={placeholder || ''}
                    className="w-full border px-3 py-2 rounded text-xs dark:border-gray-700 border-gray-200"
                />
            )}

            <ErrorMessage
                name={label}
                component="div"
                className="text-red-500 text-xs mt-1"
            />
        </div>
    );
}
