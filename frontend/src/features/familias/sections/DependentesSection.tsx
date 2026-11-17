import { Stack } from '@mui/material';

import { Repeater, TextInput, DateInput } from '../../../components/fields';
import type { DependenteFormValues } from '../types';

interface DependentesSectionProps {
  value: DependenteFormValues[];
  onChange: (dependentes: DependenteFormValues[]) => void;
  error?: string;
  disabled?: boolean;
}

export function DependentesSection({
  value,
  onChange,
  error,
  disabled = false,
}: DependentesSectionProps) {
  return (
    <Repeater<DependenteFormValues>
      label="Dependentes"
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      createEmpty={() => ({
        nome: '',
        dataNascimento: '',
        parentesco: '',
        ocupacao: '',
      })}
      getItemLabel={(dependente) =>
        dependente.nome || 'Dependente sem identificação'
      }
      validateItem={(dependente) => {
        if (!dependente.nome.trim()) {
          return 'O nome do dependente é obrigatório.';
        }

        return undefined;
      }}
      renderForm={({ item, onChange }) => {
        const updateField = (
          field: Exclude<keyof DependenteFormValues, 'id'>,
          value: string
        ) => {
          onChange({
            ...item,
            [field]: value,
          });
        };

        return (
          <Stack spacing={2}>
            <TextInput
              label="Nome"
              value={item.nome}
              onChange={(value) => updateField('nome', value)}
              required
            />

            <DateInput
              label="Data de nascimento"
              value={item.dataNascimento}
              onChange={(value) =>
                updateField('dataNascimento', value)
              }
            />

            <TextInput
              label="Parentesco"
              value={item.parentesco}
              onChange={(value) => updateField('parentesco', value)}
            />

            <TextInput
              label="Ocupação"
              value={item.ocupacao}
              onChange={(value) => updateField('ocupacao', value)}
            />
          </Stack>
        );
      }}
    />
  );
}