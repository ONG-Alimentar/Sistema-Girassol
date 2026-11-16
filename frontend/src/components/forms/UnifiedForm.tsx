
import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
} from '@mui/material';

import { ApiError } from '../../api/client';
import {
  getApiFieldErrors,
  isApiErrorResponse,
} from '../../api/errors';
import type { FormErrors } from '../../api/errors';

export type FormMode = 'create' | 'edit';

export interface UnifiedFormProps<T, R> {
  mode: FormMode;

  initialValues: T;

  validate: (values: T) => FormErrors;

  onCreate: (values: T) => Promise<R>;

  onUpdate: (values: T) => Promise<R>;

  onSuccess?: (result: R) => void;

  renderFields: (props: {
    values: T;
    setValues: React.Dispatch<React.SetStateAction<T>>;
    errors: FormErrors;
    disabled: boolean;
  }) => ReactNode;

  submitLabel?: string;
}

export function UnifiedForm<T, R>({
  mode,
  initialValues,
  validate,
  onCreate,
  onUpdate,
  onSuccess,
  renderFields,
  submitLabel,
}: UnifiedFormProps<T, R>) {
  const [values, setValues] = useState<T>(initialValues);

  const [errors, setErrors] = useState<FormErrors>({});

  const [generalError, setGeneralError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setValues(initialValues);
    setErrors({});
    setGeneralError('');
  }, [initialValues]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (loading) return;

    setGeneralError('');

    const validationErrors = validate(values);
    setErrors(validationErrors);

    if (Object.values(validationErrors).some(Boolean)) {
      return;
    }

    setLoading(true);

    try {
      const result =
        mode === 'create'
          ? await onCreate(values)
          : await onUpdate(values);

      onSuccess?.(result);
    } catch (error) {
      const fieldErrors = getApiFieldErrors(error);

      setErrors(fieldErrors);

      if (
        error instanceof ApiError &&
        isApiErrorResponse(error.body)
      ) {
        setGeneralError(error.body.message);
      } else {
        setGeneralError(
          'Não foi possível salvar os dados. Tente novamente.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
    >
      <Stack spacing={3}>
        {generalError && (
          <Alert severity="error">
            {generalError}
          </Alert>
        )}

        {renderFields({
          values,
          setValues,
          errors,
          disabled: loading,
        })}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={
              loading
                ? <CircularProgress size={18} color="inherit" />
                : undefined
            }
          >
            {submitLabel ??
              (mode === 'create'
                ? 'Cadastrar'
                : 'Salvar alterações')}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
