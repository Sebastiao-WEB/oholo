import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';

/**
 * Envolve formulários com ScrollView para o teclado não cobrir TextInput.
 * iOS: KeyboardAvoidingView com padding. Android: combina com `softwareKeyboardLayoutMode: resize` no app.json
 * e espaço extra no fundo para permitir scroll até ao campo focado.
 */
export default function KeyboardAvoidingForm({
  children,
  style,
  contentContainerStyle,
  scrollStyle,
  keyboardVerticalOffset = 0,
  scrollEnabled = true,
  ...scrollProps
}) {
  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled={Platform.OS === 'ios'}
    >
      <ScrollView
        style={[styles.flex, scrollStyle]}
        contentContainerStyle={[
          styles.flexGrow,
          Platform.OS === 'android' && styles.androidScrollBottomPad,
          contentContainerStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        showsVerticalScrollIndicator={false}
        scrollEnabled={scrollEnabled}
        nestedScrollEnabled
        {...scrollProps}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/**
 * Para ecrãs sem ScrollView global (ex.: mapa + painel inferior). iOS ajusta o layout;
 * no Android usa o redimensionamento da janela (app.json).
 */
export function KeyboardAvoidingScreen({ children, style, keyboardVerticalOffset = 0 }) {
  return (
    <KeyboardAvoidingView
      style={[styles.flex, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
      enabled={Platform.OS === 'ios'}
    >
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  flexGrow: { flexGrow: 1 },
  androidScrollBottomPad: { paddingBottom: 120 },
});
