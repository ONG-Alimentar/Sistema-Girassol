
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@mui/material';

import { UsuarioForm } from '../../features/usuarios/UsuarioForm';
import { getUsuario } from '../../api/usuarios';

import {
  emptyUsuarioForm,
  toUsuarioFormValues,
} from '../../features/usuarios/types';

import type { UsuarioFormValues } from '../../features/usuarios/types';
import type { FormMode } from '../../components/forms/UnifiedForm';

export function UsuarioFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const mode: FormMode =
    id === undefined ? 'create' : 'edit';

  const usuarioId =
    id !== undefined ? Number(id) : undefined;

  const [initialValues, setInitialValues] =
    useState<UsuarioFormValues>(emptyUsuarioForm);

  const [loading, setLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'create') {
      return;
    }

    if (
      usuarioId === undefined ||
      !Number.isSafeInteger(usuarioId) ||
      usuarioId <= 0
    ) {
      return;
    }

    let active = true;

    getUsuario(usuarioId)
      .then((usuario) => {
        if (active) {
          setInitialValues(toUsuarioFormValues(usuario));
        }
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar o usuário.');
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
  }, [mode, usuarioId]);

  if (
    mode === 'edit' &&
    (
      usuarioId === undefined ||
      !Number.isSafeInteger(usuarioId) ||
      usuarioId <= 0
    )
  ) {
    return <Alert severity="error">ID de usuário inválido.</Alert>;
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
          ? 'Cadastrar usuário'
          : 'Editar usuário'}
      </Typography>

      <UsuarioForm
        key={mode === 'create' ? 'create' : usuarioId}
        mode={mode}
        usuarioId={usuarioId}
        initialValues={initialValues}
        onSuccess={(usuario) => {
          navigate(`/admin/usuarios/${usuario.id}`);
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
