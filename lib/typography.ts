import { Text, TextInput } from 'react-native';

type DefaultPropsLike = { defaultProps?: { style?: unknown; [key: string]: unknown } };
let configured = false;

// Matches the approachable typography system used in GraduAte Mobile.
export function configureDefaultTypography() {
  if (configured) return;
  configured = true;
  const text = Text as typeof Text & DefaultPropsLike;
  const input = TextInput as typeof TextInput & DefaultPropsLike;
  text.defaultProps = text.defaultProps || {};
  text.defaultProps.style = [{ fontFamily: 'Outfit_400Regular' }, text.defaultProps.style];
  input.defaultProps = input.defaultProps || {};
  input.defaultProps.style = [{ fontFamily: 'Outfit_400Regular' }, input.defaultProps.style];
}
