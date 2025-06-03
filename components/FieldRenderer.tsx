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

  const baseInputClasses =
    "block w-full rounded-lg border border-gray-300 px-4 py-3 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base";

  const labelClasses = "block mb-2 text-sm font-semibold text-gray-700";

  return (
    <div>
      <label className={labelClasses}>
        {label} {isRequired && <span className="text-red-600">*</span>}
      </label>

      {type === "textarea" ? (
        <FormikField
          as="textarea"
          name={label}
          placeholder={placeholder || ""}
          rows={3}
          className={baseInputClasses + " resize-none"}
        />
      ) : type === "select" ? (
        <FormikField as="select" name={label} className={baseInputClasses}>
          <option value="">Select an option</option>
          {options?.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </FormikField>
      ) : type === "radio" ? (
        <div className="flex flex-wrap gap-4">
          {options?.map((opt, i) => (
            <label key={i} className="inline-flex items-center text-sm text-gray-700">
              <FormikField
                type="radio"
                name={label}
                value={opt}
                className="form-radio text-blue-600 mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : type === "checkbox" ? (
        <div className="flex flex-wrap gap-4">
          {options?.map((opt, i) => (
            <label key={i} className="inline-flex items-center text-sm text-gray-700">
              <FormikField
                type="checkbox"
                name={label}
                value={opt}
                className="form-checkbox text-blue-600 mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
      ) : (
        <FormikField
          name={label}
          type={type}
          placeholder={placeholder || ""}
          className={baseInputClasses}
        />
      )}

      <ErrorMessage
        name={label}
        component="div"
        className="text-red-600 text-xs mt-1"
      />
    </div>
  );
}
