// Pendant une manche (web) : le curseur reste dans la case de réponse.
// Entrée ou une lettre tapée ailleurs sur la page y ramènent le curseur, au lieu d'activer
// un bouton qui aurait le focus (« Quitter ») ou un raccourci d'un autre écran.
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function useKeepTyping(inputRef, active) {
  useEffect(() => {
    if (Platform.OS !== 'web' || !active) return;
    inputRef.current?.focus();
    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key.length === 1) {
        inputRef.current?.focus(); // la lettre tapée arrive dans la case
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [active]);
}
