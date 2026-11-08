
import { useState } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

import {
  TextInput,
  TextArea,
  NumberInput,
  SelectInput,
  DateInput,
  CheckboxGroup,
  Repeater,
} from '../components/fields';

interface Telefone {
  numero: string;
  descricao: string;
}

export function FieldsTest() {
  const [nome, setNome] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [quantidade, setQuantidade] = useState<number | ''>('');
  const [situacao, setSituacao] = useState('');
  const [data, setData] = useState('');
  const [servicos, setServicos] = useState<string[]>([]);
  const [telefones, setTelefones] = useState<Telefone[]>([]);
  const [mostrarErros, setMostrarErros] = useState(false);

  return (
    <Box sx={{ minHeight: '100vh', width: '100%', bgcolor: '#ffffff', color: '#212121', p: 3, }} >
      <Typography variant="h4" sx={{ mb: 3 }}>
        Teste dos componentes
      </Typography>

      <Stack spacing={3}>
        <TextInput
          label="Nome completo"
          value={nome}
          onChange={setNome}
          required
          error={
            mostrarErros && !nome.trim()
              ? 'O nome é obrigatório.'
              : undefined
          }
        />

        <TextArea
          label="Observações"
          value={observacoes}
          onChange={setObservacoes}
        />

        <NumberInput
          label="Quantidade de integrantes"
          value={quantidade}
          onChange={setQuantidade}
          min={1}
          required
          error={
            mostrarErros && (quantidade === '' || quantidade < 1)
              ? 'Informe uma quantidade válida.'
              : undefined
          }
        />

        <SelectInput
          label="Situação da família"
          value={situacao}
          onChange={setSituacao}
          required
          options={[
            { label: 'Ativa', value: 'ATIVA' },
            { label: 'Inativa', value: 'INATIVA' },
          ]}
          error={
            mostrarErros && !situacao
              ? 'Selecione uma situação.'
              : undefined
          }
        />

        <DateInput
          label="Data de nascimento"
          value={data}
          onChange={setData}
          required
          error={
            mostrarErros && !data
              ? 'Informe uma data.'
              : undefined
          }
        />

        <CheckboxGroup
          label="Serviços utilizados"
          value={servicos}
          onChange={setServicos}
          required
          options={[
            { label: 'Marmitas', value: 'MARMITAS' },
            { label: 'Cestas básicas', value: 'CESTAS' },
            { label: 'Atendimento social', value: 'SOCIAL' },
          ]}
          error={
            mostrarErros && servicos.length === 0
              ? 'Selecione pelo menos um serviço.'
              : undefined
          }
        />

        <Repeater<Telefone>
          label="Telefones"
          value={telefones}
          onChange={setTelefones}
          required
          error={
            mostrarErros && telefones.length === 0
              ? 'Cadastre pelo menos um telefone.'
              : undefined
          }
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

        <Button
          variant="contained"
          onClick={() => setMostrarErros(true)}
        >
          Testar validação
        </Button>

        <Button
          variant="outlined"
          onClick={() => setMostrarErros(false)}
        >
          Ocultar erros
        </Button>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Valores atuais
          </Typography>

          <Box
            component="pre"
            sx={{
              overflowX: 'auto',
              whiteSpace: 'pre-wrap',
              overflowWrap: 'anywhere',
              fontSize: 13,
            }}
          >
            {JSON.stringify(
              {
                nome,
                observacoes,
                quantidade,
                situacao,
                data,
                servicos,
                telefones,
              },
              null,
              2
            )}
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
