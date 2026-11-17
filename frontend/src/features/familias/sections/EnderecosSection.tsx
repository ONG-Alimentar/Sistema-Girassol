import { Box, Stack, Typography } from '@mui/material';

import { Repeater, TextInput } from '../../../components/fields';

import type { EnderecoFormValues } from '../types';

interface EnderecosSectionProps {
  value: EnderecoFormValues[];
  onChange: (enderecos: EnderecoFormValues[]) => void;
  error?: string;
  disabled?: boolean;
}

export function EnderecosSection({
  value,
  onChange,
  error,
  disabled = false,
}: EnderecosSectionProps) {
  return (
    <Repeater<EnderecoFormValues>
      label="Endereços"
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      createEmpty={() => ({
        rua: '',
        bairro: '',
        numero: '',
        complemento: '',
        cidade: '',
        cep: '',
      })}
      getItemLabel={(endereco) =>
        [
          endereco.rua,
          endereco.numero,
          endereco.bairro,
          endereco.cidade,
        ]
          .filter(Boolean)
          .join(', ') || 'Endereço sem identificação'
      }
      validateItem={(endereco) => {
        if (!endereco.rua.trim()) {
        return 'A rua é obrigatória.';
        }

        return undefined;
    }}
      renderForm={({ item, onChange }) => {
        const updateField = (
          field: keyof Omit<EnderecoFormValues, 'id'>,
          value: string
        ) => {
          onChange({
            ...item,
            [field]: value,
          });
        };

        return (
          <Stack spacing={2}>
            <Typography variant="subtitle2">
              Dados do endereço
            </Typography>

            <TextInput
              label="Rua"
              value={item.rua}
              onChange={(value) => updateField('rua', value)}
              required
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                gap: 2,
              }}
            >
              <TextInput
                label="Número"
                value={item.numero}
                onChange={(value) => updateField('numero', value)}
              />

              <TextInput
                label="Bairro"
                value={item.bairro}
                onChange={(value) => updateField('bairro', value)}
              />

              <TextInput
                label="Cidade"
                value={item.cidade}
                onChange={(value) => updateField('cidade', value)}
              />

              <TextInput
                label="CEP"
                value={item.cep}
                onChange={(value) => updateField('cep', value)}
              />
            </Box>

            <TextInput
              label="Complemento"
              value={item.complemento}
              onChange={(value) =>
                updateField('complemento', value)
              }
            />
          </Stack>
        );
      }}
    />
  );
}