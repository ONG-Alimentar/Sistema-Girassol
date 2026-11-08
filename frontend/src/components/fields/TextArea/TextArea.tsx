import TextField from '@mui/material/TextField';
import type { BaseFieldProps } from '../types';

interface TextAreaProps extends BaseFieldProps<string> {
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function TextArea({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  placeholder,
  rows = 4,
  maxLength,
}: TextAreaProps) {
  return (
    <TextField
      fullWidth
      multiline
      rows={rows}
      size="small"
      variant="outlined"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error}
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