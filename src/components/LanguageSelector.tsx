import { useEffect, useRef, useState } from 'preact/hooks';
import { getLocale, changeLanguage, getFlagEmoji, getLocaleLabel, type Locale } from '../lib/i18n';

const LOCALES: Locale[] = ['es', 'en', 'ja'];

export default function LanguageSelector() {
  const [current, setCurrent] = useState<Locale>('es');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loc = getLocale();
    setCurrent(loc);
    document.documentElement.lang = loc;
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  async function select(loc: Locale) {
    setOpen(false);
    changeLanguage(loc);
    setCurrent(loc);
    window.dispatchEvent(new Event('langchange'));
  }

  return (
    <div ref={ref} class="relative">
      <button
        onClick={() => setOpen(!open)}
        class="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center bg-transparent cursor-pointer text-xl leading-none"
        aria-label="Idioma"
      >
        {getFlagEmoji(current)}
      </button>

      {open && (
        <div class="absolute right-0 top-full mt-1 bg-white rounded-2xl shadow-lg py-sm z-50 min-w-[150px]">
          {LOCALES.map((loc) => (
            <button
              key={loc}
              onClick={() => select(loc)}
              class={`w-full flex items-center gap-sm px-md py-sm text-sm font-medium bg-transparent border-none cursor-pointer hover:bg-header-blue/5 transition-colors ${current === loc ? 'text-header-blue' : 'text-text-primary'}`}
            >
              <span class="text-[22px]">{getFlagEmoji(loc)}</span>
              <span>{getLocaleLabel(loc)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
