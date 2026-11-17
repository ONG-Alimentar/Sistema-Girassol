import { Stack } from '@mui/material';

import { Repeater, TextInput } from '../../../components/fields';
import type { ProblemaSaudeFormValues } from '../types';

interface Props {
  value: ProblemaSaudeFormValues[];
  onChange: (items: ProblemaSaudeFormValues[]) => void;
  error?: string;
  disabled?: boolean;
}

export function ProblemasSaudeSection({
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  return (
    <Repeater<ProblemaSaudeFormValues>
      label="Problemas de saúde"
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      createEmpty={() => ({
        descricao: '',
        gravidade: '',
      })}
      getItemLabel={(item) => item.descricao}
      validateItem={(item) =>
        !item.descricao.trim()
          ? 'A descrição do problema de saúde é obrigatória.'
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
            label="Gravidade"
            value={item.gravidade}
            onChange={(gravidade) =>
              onChange({ ...item, gravidade })
            }
          />
        </Stack>
      )}
    />
  );
}