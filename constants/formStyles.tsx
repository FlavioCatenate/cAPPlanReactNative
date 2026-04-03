import { StyleSheet } from 'react-native';
import Colors from '../constants/colors';
import Typography from '../constants/typography';

const formStyles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.backgroundColor },
  content: { padding: 20, paddingBottom: 60 },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
  },
  label: {
    ...Typography.body,
    fontWeight: '600',
    color: Colors.mainTextColor,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.backgroundColor,
    borderRadius: 8,
    padding: 12,
    backgroundColor: Colors.surfaceColor,
    color: Colors.mainTextColor,
    fontSize: 15,
  },
  textArea: { minHeight: 100 },
  actions: { marginTop: 24 },
  submitButton: {
    backgroundColor: Colors.secondaryGray,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  cancelText: {
    color: Colors.mainTextColor,
    textAlign: 'center',
    paddingVertical: 18,
  },
});

export { formStyles };