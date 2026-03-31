import { useState } from 'react';
import { TouchableOpacity, TextInput, View, StyleSheet } from 'react-native';
import DatePicker from 'react-native-date-picker';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

interface DatePickerInputProps {
  label?: string;
  value: string; // "YYYY-MM-DD"
  onChange: (dateString: string) => void;
  minimumDate?: Date;
  maximumDate?: Date;
  mode?: 'date' | 'time' | 'datetime';
}

export default function DatePickerInput({
  label = 'Seleziona data',
  value,
  onChange,
  minimumDate,
  maximumDate,
  mode = 'date',
}: DatePickerInputProps) {
  const [open, setOpen] = useState(false);

  // Converte "YYYY-MM-DD" → Date
  const parseDateString = (str: string): Date => {
    if (!str) return new Date();
    try {
      const [year, month, day] = str.split('-').map(Number);
      return new Date(year, month - 1, day);
    } catch {
      return new Date();
    }
  };

  // Converte Date → "YYYY-MM-DD"
  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleConfirm = (selectedDate: Date) => {
    const dateString = formatDateString(selectedDate);
    onChange(dateString);
    setOpen(false);
  };

  const displayValue = value
    ? new Date(parseDateString(value)).toLocaleDateString('it-IT', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    : 'Seleziona data';

  return (
    <View>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <TextInput
          value={displayValue}
          placeholder={label}
          editable={false}
          style={styles.input}
          pointerEvents="none"
        />
      </TouchableOpacity>

      <DatePicker
        modal
        open={open}
        date={parseDateString(value)}
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
        mode={mode}
        locale="it"
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        title="Seleziona una data"
        confirmText="Conferma"
        cancelText="Annulla"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    borderRadius: 8,
    backgroundColor: Colors.surfaceColor,
    overflow: 'hidden',
  },
  input: {
    padding: 12,
    ...Typography.body,
  },
});
