
import { Stack, Typography, Divider } from '@mui/material';

import {
  TextInput,
  TextArea,
  SelectInput,
  DateInput,
} from '../../components/fields';

import {
  UnifiedForm,
} from '../../components/forms/UnifiedForm';

import type { FormMode } from '../../components/forms/UnifiedForm';
import type { FamiliaFormValues, FamiliaResponse } from './types';

import {
  emptyFamiliaForm,
  toFamiliaRequest,
} from './types';

import { validateFamilia } from './familiaValidation';

import {
  createFamilia,
  updateFamilia,
} from './familiaApi';

interface FamiliaFormProps {
  mode: FormMode;
  familiaId?: number;
  initialValues?: FamiliaFormValues;
  onSuccess?: (familia: FamiliaResponse) => void;
}

export function FamiliaForm({
  mode,
  familiaId,
  initialValues = emptyFamiliaForm,
  onSuccess,
}: FamiliaFormProps) {

  async function handleCreate(values: FamiliaFormValues) {
    return createFamilia(toFamiliaRequest(values));
  }

  async function handleUpdate(values: FamiliaFormValues) {
    if (familiaId === undefined) {
      throw new Error('ID da família não informado.');
    }

    return updateFamilia(
      familiaId,
      toFamiliaRequest(values)
    );
  }

  return (
    <UnifiedForm<FamiliaFormValues, FamiliaResponse>
      mode={mode}
      initialValues={initialValues}
      validate={validateFamilia}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onSuccess={onSuccess}
      renderFields={({
        values,
        setValues,
        errors,
        disabled,
      }) => {

        function updateField(
          field: keyof FamiliaFormValues,
          value: string
        ) {
          setValues((prev) => ({
            ...prev,
            [field]: value,
          }));
        }

        return (
          <Stack spacing={3}>
            <Typography variant="h6">
              Dados pessoais
            </Typography>

            <TextInput
              label="Nome"
              value={values.nome}
              onChange={(value) =>
                updateField('nome', value)
              }
              error={errors.nome}
              disabled={disabled}
              required
            />

            <TextInput
              label="Nome social"
              value={values.nomeSocial}
              onChange={(value) =>
                updateField('nomeSocial', value)
              }
              error={errors.nomeSocial}
              disabled={disabled}
            />

            <DateInput
              label="Data de nascimento"
              value={values.dataNascimento}
              onChange={(value) =>
                updateField('dataNascimento', value)
              }
              error={errors.dataNascimento}
              disabled={disabled}
            />

            <SelectInput
              label="Gênero"
              value={values.genero}
              onChange={(value) =>
                updateField('genero', value)
              }
              options={[
                { label: 'Feminino', value: 'FEMININO' },
                { label: 'Masculino', value: 'MASCULINO' },
                { label: 'Outro', value: 'OUTRO' },
              ]}
              error={errors.genero}
              disabled={disabled}
            />

            <SelectInput
              label="Estado civil"
              value={values.estadoCivil}
              onChange={(value) =>
                updateField('estadoCivil', value)
              }
              options={[
                { label: 'Solteiro(a)', value: 'SOLTEIRO' },
                { label: 'Casado(a)', value: 'CASADO' },
                { label: 'Divorciado(a)', value: 'DIVORCIADO' },
                { label: 'Viúvo(a)', value: 'VIUVO' },
                { label: 'União estável', value: 'UNIAO' },
              ]}
              error={errors.estadoCivil}
              disabled={disabled}
            />

            <TextInput
              label="Nome da mãe"
              value={values.nomeMae}
              onChange={(value) =>
                updateField('nomeMae', value)
              }
              error={errors.nomeMae}
              disabled={disabled}
            />

            <Divider />

            <Typography variant="h6">
              Documentos e contato
            </Typography>

            <TextInput
              label="CPF"
              value={values.cpf}
              onChange={(value) =>
                updateField('cpf', value)
              }
              error={errors.cpf}
              disabled={disabled}
            />

            <TextInput
              label="RG"
              value={values.rg}
              onChange={(value) =>
                updateField('rg', value)
              }
              error={errors.rg}
              disabled={disabled}
            />

            <TextInput
              label="NIS"
              value={values.nis}
              onChange={(value) =>
                updateField('nis', value)
              }
              error={errors.nis}
              disabled={disabled}
            />

            <TextInput
              label="Email"
              value={values.email}
              onChange={(value) =>
                updateField('email', value)
              }
              error={errors.email}
              disabled={disabled}
            />

            <TextInput
              label="Naturalidade"
              value={values.naturalidade}
              onChange={(value) =>
                updateField('naturalidade', value)
              }
              error={errors.naturalidade}
              disabled={disabled}
            />

            <SelectInput
              label="Indicação"
              value={values.indicacao}
              onChange={(value) =>
                updateField('indicacao', value)
              }
              options={[
                { label: 'Recomendação de amigos ou conhecidos', value: 'RECOMENDACAO' },
                { label: 'Encaminhamento da rede pública', value: 'ENCAMINHAMENTO' },
                { label: 'Redes sociais', value: 'REDES' },
                { label: 'Outro', value: 'OUTRO' },
              ]}
              error={errors.indicacao}
              disabled={disabled}
            />

            <Divider />

            <Typography variant="h6">
              Informações adicionais
            </Typography>

            <TextArea
              label="Observações"
              value={values.observacoes}
              onChange={(value) =>
                updateField('observacoes', value)
              }
              error={errors.observacoes}
              disabled={disabled}
            />
          </Stack>
        );
      }}
    />
  );
}
