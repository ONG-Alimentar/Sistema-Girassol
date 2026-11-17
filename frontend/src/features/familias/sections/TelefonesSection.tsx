import { Repeater, TextInput } from '../../../components/fields';

export interface TelefoneFormValues {
  id?: number;
  numero: string;
}

interface TelefonesSectionProps {
  value: TelefoneFormValues[];
  onChange: (telefones: TelefoneFormValues[]) => void;
  error?: string;
  disabled?: boolean;
}

export function TelefonesSection({
  value,
  onChange,
  error,
  disabled = false,
}: TelefonesSectionProps) {
  return (
    <Repeater<TelefoneFormValues>
      label="Telefones"
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      createEmpty={() => ({
        numero: '',
      })}
      getItemLabel={(telefone) => telefone.numero}
      validateItem={(telefone) => {
        if (!telefone.numero.trim()) {
          return 'Informe o número do telefone.';
        }

        return undefined;
      }}
      renderForm={({ item, onChange }) => (
        <TextInput
          label="Número do telefone"
          value={item.numero}
          onChange={(numero) =>
            onChange({
              ...item,
              numero,
            })
          }
          required
        />
      )}
    />
  );
}