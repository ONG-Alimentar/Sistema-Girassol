import { useEffect, useState } from 'react';
import { Alert, CircularProgress, Stack } from '@mui/material';

import { CheckboxGroup } from '../../../components/fields';
import { getServicos } from '../servicoApi';

import type { ServicoResponse } from '../types';

interface Props {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
}

export function ServicosSection({
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  const [servicos, setServicos] = useState<ServicoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarServicos() {
      try {
        const resultado = await getServicos();

        if (ativo) {
          setServicos(resultado);
        }
      } catch {
        if (ativo) {
          setLoadError(true);
        }
      } finally {
        if (ativo) {
          setLoading(false);
        }
      }
    }

    carregarServicos();

    return () => {
      ativo = false;
    };
  }, []);

  if (loading) {
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        <CircularProgress size={20} />
        <span>Carregando serviços...</span>
      </Stack>
    );
  }

  if (loadError) {
    return (
      <Alert severity="error">
        Não foi possível carregar os serviços disponíveis.
      </Alert>
    );
  }

  if (servicos.length === 0) {
    return (
      <Alert severity="info">
        Nenhum serviço está cadastrado no sistema.
      </Alert>
    );
  }

  const options = servicos.map((servico) => ({
    value: String(servico.id),
    label: servico.nome,
  }));

  return (
    <CheckboxGroup
      label="Serviços vinculados à família"
      value={value}
      onChange={onChange}
      options={options}
      error={error}
      disabled={disabled}
    />
  );
}