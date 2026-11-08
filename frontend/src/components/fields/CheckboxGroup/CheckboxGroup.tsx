import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import FormHelperText from '@mui/material/FormHelperText';

import type { BaseFieldProps, SelectOption } from '../types';

interface CheckboxGroupProps extends BaseFieldProps<string[]> {
  options: SelectOption[];
}

export function CheckboxGroup({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  options,
}: CheckboxGroupProps) {

  function handleChange(optionValue: string, checked: boolean) {
    if (checked) {
      onChange([...value, optionValue]);
    } else {
      onChange(value.filter((item) => item !== optionValue));
    }
  }

  return (
    <FormControl
      component="fieldset"
      error={Boolean(error)}
      disabled={disabled}
      required={required}
    >
      <FormLabel component="legend">
        {label}
      </FormLabel>

      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            key={option.value}
            label={option.label}
            control={
              <Checkbox
                checked={value.includes(option.value)}
                onChange={(event) =>
                  handleChange(option.value, event.target.checked)
                }
                size="small"
              />
            }
          />
        ))}
      </FormGroup>

      {error && (
        <FormHelperText>{error}</FormHelperText>
      )}
    </FormControl>
  );
}