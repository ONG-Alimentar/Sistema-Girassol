import { Stack } from '@mui/material';

import {
  TextInput,
  SelectInput,
} from '../../../components/fields';

import type {
  SituacaoSocioeconomicaFormValues,
  TipoMoradia,
  Renda,
} from '../types';

import {
  tipoMoradiaOptions,
  rendaOptions,
  acessoAlimentacaoOptions,
} from '../situacaoSocioeconomicaOptions';

interface Props {
  value: SituacaoSocioeconomicaFormValues;
  onChange: (value: SituacaoSocioeconomicaFormValues) => void;
  disabled?: boolean;
}

export function SituacaoSocioeconomicaSection({
  value,
  onChange,
  disabled = false,
}: Props) {
  const updateField = (
    field: keyof SituacaoSocioeconomicaFormValues,
    fieldValue: string
  ) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <Stack spacing={2}>
      <TextInput
        label="Profissão"
        value={value.profissao}
        onChange={(v) => updateField('profissao', v)}
        disabled={disabled}
      />

      <TextInput
        label="Escolaridade"
        value={value.escolaridade}
        onChange={(v) => updateField('escolaridade', v)}
        disabled={disabled}
      />

      <SelectInput
        label="Tipo de moradia"
        value={value.tipoMoradia}
        options={tipoMoradiaOptions}
        onChange={(v) =>
          onChange({
            ...value,
            tipoMoradia: v as TipoMoradia | '',
          })
        }
        disabled={disabled}
      />

      <SelectInput
        label="Renda"
        value={value.renda}
        options={rendaOptions}
        onChange={(v) =>
          onChange({
            ...value,
            renda: v as Renda | '',
          })
        }
        disabled={disabled}
      />

      <TextInput
        label="Benefício"
        value={value.beneficio}
        onChange={(v) => updateField('beneficio', v)}
        disabled={disabled}
      />

      <SelectInput
        label="Acesso à alimentação"
        value={value.acessoAlimentacao}
        options={acessoAlimentacaoOptions}
        onChange={(v) =>
          onChange({
            ...value,
            acessoAlimentacao: v as 'sim' | 'nao' | '',
          })
        }
        disabled={disabled}
      />
    </Stack>
  );
}