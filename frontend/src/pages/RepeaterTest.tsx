import { useState } from 'react';

import Stack from '@mui/material/Stack';

import {
  Repeater,
  TextInput,
} from '../components/fields';

interface Telefone {
  numero: string;
  descricao: string;
}

export function RepeaterDemo() {
  const [telefones, setTelefones] = useState<Telefone[]>([]);

  return (
    <Stack spacing={2}>
      <Repeater<Telefone>
        label="Telefones"
        value={telefones}
        onChange={setTelefones}
        createEmpty={() => ({
          numero: '',
          descricao: '',
        })}
        getItemLabel={(telefone) =>
          `${telefone.numero} - ${telefone.descricao}`
        }
        validateItem={(telefone) => {
          if (!telefone.numero.trim()) {
            return 'O número do telefone é obrigatório.';
          }

          return undefined;
        }}
        renderForm={({ item, onChange }) => (
          <Stack spacing={2}>
            <TextInput
              label="Número"
              value={item.numero}
              onChange={(numero) =>
                onChange({ ...item, numero })
              }
              required
            />

            <TextInput
              label="Descrição"
              value={item.descricao}
              onChange={(descricao) =>
                onChange({ ...item, descricao })
              }
            />
          </Stack>
        )}
      />
    </Stack>
  );
}