import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import type { BaseFieldProps } from '../types';

interface DateInputProps extends BaseFieldProps<string> {}

export function DateInput({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
}: DateInputProps) {
  const [pickerError, setPickerError] = useState(false);

  const dateValue = value ? dayjs(value) : null;

  return (
    <DatePicker
      label={label}
      value={dateValue}
      format="DD/MM/YYYY"
      disabled={disabled}
      onChange={(newValue: Dayjs | null) => {
        if (newValue === null) {
          onChange('');
        } else if (newValue.isValid()) {
          onChange(newValue.format('YYYY-MM-DD'));
        }
      }}
      onError={(reason) => {
        setPickerError(reason !== null);
      }}
      slotProps={{
        textField: {
          fullWidth: true,
          size: 'small',
          required,
          error: Boolean(error) || pickerError,
          helperText: error || (pickerError ? 'Informe uma data válida.' : ' '),
        },
      }}
    />
  );
}