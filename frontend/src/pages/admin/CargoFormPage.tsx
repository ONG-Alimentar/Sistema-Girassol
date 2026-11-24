
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';

import { CargoForm } from '../../features/cargos/CargoForm';
import { getCargo } from '../../api/cargos';

import {
  emptyCargoForm,
  toCargoFormValues,
} from '../../features/cargos/types';

import type { CargoFormValues } from '../../features/cargos/types';
import type { FormMode } from '../../components/forms/UnifiedForm';

export function CargoFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const mode: FormMode =
    id === undefined ? 'create' : 'edit';

  const cargoId =
    id !== undefined ? Number(id) : undefined;

  const [initialValues, setInitialValues] =
    useState<CargoFormValues>(emptyCargoForm);

  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'create') {
      return;
    }

    if (
      cargoId === undefined ||
      !Number.isSafeInteger(cargoId) ||
      cargoId <= 0
    ) {
      return;
    }

    let active = true;

    getCargo(cargoId)
      .then((cargo) => {
        if (active) {
          setInitialValues(toCargoFormValues(cargo));
        }
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar o cargo.');
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
  }, [mode, cargoId]);

  if (
    mode === 'edit' &&
    (
      cargoId === undefined ||
      !Number.isSafeInteger(cargoId) ||
      cargoId <= 0
    )
  ) {
    return <Alert severity="error">ID de cargo inválido.</Alert>;
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
    <Box sx={{ maxWidth: 650, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        {mode === 'create'
          ? 'Cadastrar cargo'
          : 'Editar cargo'}
      </Typography>

      <CargoForm
        key={mode === 'create' ? 'create' : cargoId}
        mode={mode}
        cargoId={cargoId}
        initialValues={initialValues}
        onSuccess={(cargo) => {
          navigate(`/admin/cargos/${cargo.id}`);
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
