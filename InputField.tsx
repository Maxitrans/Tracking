
import React from 'react';

interface InputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  placeholder?: string;
  isLabelHidden?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({ 
  id, 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '',
  isLabelHidden = false 
}) => {
  return (
    <div className="w-full">
      <label htmlFor={id} className={`${isLabelHidden ? 'sr-only' : 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'}`}>
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition"
        required
      />
    </div>
  );
};

export default InputField;
