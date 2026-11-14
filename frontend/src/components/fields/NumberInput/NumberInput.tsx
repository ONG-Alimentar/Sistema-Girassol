import TextField from '@mui/material/TextField';
import type { BaseFieldProps } from '../types';

interface NumberInputProps extends BaseFieldProps<number | ''> {
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
}

export function NumberInput({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  min,
  max,
  step = 1,
  placeholder,
}: NumberInputProps) {
  return (
    <TextField
      fullWidth
      type="number"
      size="small"
      variant="outlined"
      label={label}
      value={value}
      onChange={(event) => {
        const newValue = event.target.value;

        onChange(newValue === '' ? '' : Number(newValue));
      }}
      error={Boolean(error)}
      helperText={error || ' '}
      disabled={disabled}
      required={required}
      placeholder={placeholder}
      slotProps={{
        htmlInput: {
          min,
          max,
          step,
        },
      }}
    />
  );
}