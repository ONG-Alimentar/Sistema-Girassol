export interface BaseFieldProps<T> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export interface SelectOption {
  label: string;
  value: string;
}