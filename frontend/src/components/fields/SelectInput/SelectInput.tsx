import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import type { BaseFieldProps, SelectOption } from '../types';

interface SelectInputProps extends BaseFieldProps<string> {
  options: SelectOption[];
  placeholder?: string;
}

export function SelectInput({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  options,
  placeholder,
}: SelectInputProps) {
  return (
    <TextField
      fullWidth
      select
      size="small"
      variant="outlined"
      label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error || ' '}
      disabled={disabled}
      required={required}
    >
      {placeholder && (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      )}

      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}