import React from 'react'

type Lang = 'en' | 'id'

interface LangToggleProps {
    activeLang: Lang
    onChange: (lang: Lang) => void
}

/** Reusable EN / Indonesia language tab toggle */
export default function LangToggle({ activeLang, onChange }: LangToggleProps) {
    return (
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 w-fit shrink-0 mb-4">
            {(['en', 'id'] as Lang[]).map((lang) => (
                <button
                    key={lang}
                    type="button"
                    onClick={() => onChange(lang)}
                    className={`px-5 py-1.5 rounded-md text-sm font-medium transition-all ${activeLang === lang
                            ? 'bg-blue-600 text-white shadow shadow-blue-900/40'
                            : 'text-slate-400 hover:text-white hover:bg-slate-700'
                        }`}
                >
                    {lang === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
                </button>
            ))}
        </div>
    )
}

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Read a translated field from metadata.translations.{lang}.{field}.
 *  Falls back to the top-level field value when translation is absent. */
export function getTranslation(
    metadata: Record<string, any> | undefined,
    lang: string,
    field: string,
    fallback: string = ''
): string {
    if (!metadata) return fallback
    const val = metadata?.translations?.[lang]?.[field]
    return val !== undefined && val !== null && String(val).trim() !== ''
        ? String(val)
        : fallback
}

/** Return a new metadata object with the translation field set. */
export function setTranslation(
    metadata: Record<string, any> | undefined,
    lang: string,
    field: string,
    value: string
): Record<string, any> {
    const base = metadata ? { ...metadata } : {}
    base.translations = base.translations ? { ...base.translations } : {}
    base.translations[lang] = base.translations[lang] ? { ...base.translations[lang] } : {}
    base.translations[lang][field] = value
    return base
}
