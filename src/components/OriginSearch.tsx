import { SbbAutocomplete } from '@sbb-esta/lyne-react/autocomplete';
import { SbbFormField } from '@sbb-esta/lyne-react/form-field';
import { SbbOption } from '@sbb-esta/lyne-react/option';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '../i18n/I18nProvider';
import type { RouterClient } from '../router-client';
import type { SearchHit } from '../state/types';

export type OriginSearchProps = {
  client: RouterClient;
  currentName: string;
  onPick: (hit: SearchHit) => void;
};

export function OriginSearch({ client, currentName, onPick }: OriginSearchProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);
  const hitsRef = useRef<SearchHit[]>([]);
  const onPickRef = useRef(onPick);
  const [hits, setHits] = useState<SearchHit[]>([]);

  hitsRef.current = hits;
  onPickRef.current = onPick;

  // Push externally driven label changes into the uncontrolled input
  // without triggering a new search.
  useEffect(() => {
    const el = inputRef.current;
    if (!el || el.value === currentName) return;
    el.value = currentName;
    setHits([]);
  }, [currentName]);

  // Listen to option selection from the autocomplete component
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handleInputAutocomplete = (e: Event) => {
      const customEvent = e as Event & { option?: { value: string } };
      const optionValue = customEvent.option?.value;
      if (!optionValue) return;

      const hit = hitsRef.current.find((h) => h.name === optionValue);
      if (hit) {
        setHits([]);
        onPickRef.current(hit);
      }
    };

    el.addEventListener('inputAutocomplete', handleInputAutocomplete);
    return () => {
      el.removeEventListener('inputAutocomplete', handleInputAutocomplete);
    };
  }, []);

  function onInput(e: React.FormEvent<HTMLInputElement>) {
    // If the input event is programmatic (untrusted), ignore it.
    if (!e.nativeEvent.isTrusted) {
      return;
    }

    const value = (e.target as HTMLInputElement).value;
    window.clearTimeout(debounceRef.current);
    const q = value.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const results = await client.search(q);
        setHits(results);
      } catch {
        setHits([]);
      }
    }, 160);
  }

  return (
    <div className="field">
      <span className="field-label">{t.from}</span>
      <SbbFormField size="m">
        <input
          ref={inputRef}
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder={t.searchOriginPlaceholder}
          defaultValue={currentName}
          onInput={onInput}
        />
        <SbbAutocomplete>
          {hits.map((hit) => (
            <SbbOption key={hit.id} value={hit.name}>
              {hit.name}
            </SbbOption>
          ))}
        </SbbAutocomplete>
      </SbbFormField>
    </div>
  );
}
