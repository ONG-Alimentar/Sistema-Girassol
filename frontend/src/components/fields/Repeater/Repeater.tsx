import { useState } from 'react';
import type { ReactNode } from 'react';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import type { BaseFieldProps } from '../types';

// Key por identidade do item, não por índice: ao remover um item do meio, o
// índice faz o React reaproveitar a linha errada. onChange preserva as
// referências dos itens não alterados, então a key fica estável. O WeakMap não
// impede a coleta dos itens já removidos.
const itemKeys = new WeakMap<object, number>();
let nextItemKey = 0;
function keyFor(item: object) {
  let key = itemKeys.get(item);
  if (key === undefined) {
    key = nextItemKey++;
    itemKeys.set(item, key);
  }
  return key;
}

interface RepeaterProps<T> extends BaseFieldProps<T[]> {
  createEmpty: () => T;
  getItemLabel: (item: T) => string;
  renderForm: (props: {
    item: T;
    onChange: (item: T) => void;
    onSave: () => void;
    onCancel: () => void;
  }) => ReactNode;
  validateItem?: (item: T) => string | undefined;
}

export function Repeater<T>({
  label,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  createEmpty,
  getItemLabel,
  renderForm,
  validateItem,
}: RepeaterProps<T>) {

  const [draft, setDraft] = useState<T | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [itemError, setItemError] = useState<string>();

  function handleAdd() {
    setDraft(createEmpty());
    setEditingIndex(null);
    setItemError(undefined);
  }

  function handleEdit(index: number) {
    setDraft(structuredClone(value[index]));
    setEditingIndex(index);
    setItemError(undefined);
  }

  function handleCancel() {
    setDraft(null);
    setEditingIndex(null);
    setItemError(undefined);
  }

  function handleSave() {
    if (draft === null) return;

    const validationError = validateItem?.(draft);
    if (validationError) {
      setItemError(validationError);
      return;
    }

    if (editingIndex !== null) {
      const updatedItems = value.map((item, index) =>
        index === editingIndex ? draft : item
      );

      onChange(updatedItems);
    } else {
      onChange([...value, draft]);
    }

    handleCancel();
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <FormControl fullWidth error={Boolean(error)} disabled={disabled}>
      <FormLabel required={required}>{label}</FormLabel>

      <Stack spacing={1} sx={{ mt: 1 }}>
        {value.map((item, index) => (
          <Paper
            key={keyFor(item as object)}
            variant="outlined"
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="body2">
              {getItemLabel(item)}
            </Typography>

            <Box>
              <IconButton
                aria-label="Editar item"
                onClick={() => handleEdit(index)}
                disabled={disabled || draft !== null}
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>

              <IconButton
                aria-label="Remover item"
                onClick={() => handleRemove(index)}
                disabled={disabled || draft !== null}
                size="small"
                color="error"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Stack>

      {draft !== null ? (
        <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
          {renderForm({
            item: draft,
            onChange: setDraft,
            onSave: handleSave,
            onCancel: handleCancel,
          })}

          {itemError && (
            <FormHelperText error>{itemError}</FormHelperText>
          )}

          <Stack
            direction="row"
            sx={{
              justifyContent: 'flex-end',
              gap: 1,
              mt: 2,
            }}
          >
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleCancel}
            >
              Cancelar
            </Button>

            <Button variant="contained" onClick={handleSave}>
              Salvar
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Button
          variant="outlined"
          onClick={handleAdd}
          disabled={disabled}
          sx={{ mt: 2, alignSelf: 'flex-start' }}
        >
          Adicionar
        </Button>
      )}

      {error && <FormHelperText>{error}</FormHelperText>}
    </FormControl>
  );
}