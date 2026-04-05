import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';

/**
 * Deslocamento inferior (px) para painéis com `position: 'absolute'; bottom: 0`
 * quando o teclado abre — necessário no iOS; no Android `softwareKeyboardLayoutMode: resize` costuma bastar.
 */
export function useKeyboardBottomInset() {
  const [bottom, setBottom] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return undefined;
    }

    const onShow = (e) => {
      setBottom(e?.endCoordinates?.height ?? 0);
    };
    const onHide = () => setBottom(0);

    const subShow = Keyboard.addListener('keyboardWillShow', onShow);
    const subHide = Keyboard.addListener('keyboardWillHide', onHide);

    return () => {
      subShow.remove();
      subHide.remove();
    };
  }, []);

  return bottom;
}
