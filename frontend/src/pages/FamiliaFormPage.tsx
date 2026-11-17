
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';

import { FamiliaForm } from '../features/familias/FamiliaForm';
import { getFamilia } from '../features/familias/familiaApi';

import {
  emptyFamiliaForm,
  toFamiliaFormValues,
} from '../features/familias/types';

import type { FamiliaFormValues } from '../features/familias/types';
import type { FormMode } from '../components/forms/UnifiedForm';

export function FamiliaFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const mode: FormMode =
    id === undefined ? 'create' : 'edit';

  const familiaId =
    id !== undefined ? Number(id) : undefined;

  const [initialValues, setInitialValues] =
    useState<FamiliaFormValues>(emptyFamiliaForm);

  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'create') {
      return;
    }

    if (
      familiaId === undefined ||
      !Number.isSafeInteger(familiaId) ||
      familiaId <= 0
    ) {
      return;
    }

    let active = true;

    getFamilia(familiaId)
      .then((familia) => {
        if (active) {
          setInitialValues(toFamiliaFormValues(familia));
        }
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar a família.');
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [mode, familiaId]);

  if (
    mode === 'edit' &&
    (
      familiaId === undefined ||
      !Number.isSafeInteger(familiaId) ||
      familiaId <= 0
    )
  ) {
    return <Alert severity="error">ID de família inválido.</Alert>;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">{error}</Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 850, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {mode === 'create'
          ? 'Cadastrar família'
          : 'Editar família'}
      </Typography>

      <FamiliaForm
        key={mode === 'create' ? 'create' : familiaId}
        mode={mode}
        familiaId={familiaId}
        initialValues={initialValues}
        onSuccess={(familia) => {
          navigate(`/familias/${familia.id}`);
        }}
      />

      <Button
        variant="text"
        color="inherit"
        onClick={() => navigate(-1)}
        sx={{ mt: 2 }}
      >
        Voltar
      </Button>
    </Box>
  );
}
