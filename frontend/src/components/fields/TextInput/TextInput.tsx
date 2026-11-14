import TextField from '@mui/material/TextField';
import type { BaseFieldProps } from '../types';

interface TextInputProps extends BaseFieldProps<string> {
  placeholder?: string;
  maxLength?: number;
}

export function TextInput({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  placeholder,
  maxLength,
}: TextInputProps) {
  return (
    <TextField
      fullWidth
      size="small"
      variant="outlined"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error || ' '}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      slotProps={{
        htmlInput: {
          maxLength,
        },
      }}
    />
  );
}