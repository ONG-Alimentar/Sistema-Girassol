import { Repeater, TextInput } from '../../../components/fields';
import type { SubstanciaFormValues } from '../types';

interface Props {
  value: SubstanciaFormValues[];
  onChange: (items: SubstanciaFormValues[]) => void;
  error?: string;
  disabled?: boolean;
}

export function SubstanciasSection({
  value,
  onChange,
  error,
  disabled = false,
}: Props) {
  return (
    <Repeater<SubstanciaFormValues>
      label="Substâncias"
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      createEmpty={() => ({
        descricao: '',
      })}
      getItemLabel={(item) => item.descricao}
      validateItem={(item) =>
        !item.descricao.trim()
          ? 'A descrição da substância é obrigatória.'
          : undefined
      }
      renderForm={({ item, onChange }) => (
        <TextInput
          label="Descrição"
          value={item.descricao}
          onChange={(descricao) =>
            onChange({ ...item, descricao })
          }
          required
        />
      )}
    />
  );
}