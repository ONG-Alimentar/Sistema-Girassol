import { Stack } from '@mui/material';

import { Repeater, TextInput } from '../../../components/fields';
import type { MedicamentoFormValues } from '../types';

interface Props {
  value: MedicamentoFormValues[];
  onChange: (items: MedicamentoFormValues[]) => void;
  error?: string;
  disabled?: boolean;
}

export function MedicamentosSection({
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  return (
    <Repeater<MedicamentoFormValues>
      label="Medicamentos"
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      createEmpty={() => ({
        descricao: '',
        dosagem: '',
      })}
      getItemLabel={(item) => item.descricao}
      validateItem={(item) =>
        !item.descricao.trim()
          ? 'A descrição do medicamento é obrigatória.'
          : undefined
      }
      renderForm={({ item, onChange }) => (
        <Stack spacing={2}>
          <TextInput
            label="Descrição"
            value={item.descricao}
            onChange={(descricao) =>
              onChange({ ...item, descricao })
            }
            required
          />

          <TextInput
            label="Dosagem"
            value={item.dosagem}
            onChange={(dosagem) =>
              onChange({ ...item, dosagem })
            }
          />
        </Stack>
      )}
    />
  );
}