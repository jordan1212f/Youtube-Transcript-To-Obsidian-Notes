import { useState, useEffect } from 'react'
import { ACCENT_PRESETS } from '../data/constants'

export function useTheme() {
  const [theme, setTheme] = useState('dark')
  const [accent, setAccent] = useState('teal')
  const [fontset, setFontset] = useState('modern')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.setAttribute('data-fontset', fontset)
  }, [fontset])

  useEffect(() => {
    const preset = ACCENT_PRESETS[accent]
    if (!preset) return
    const root = document.documentElement.style
    root.setProperty('--accent', preset.accent)
    root.setProperty('--accent-bright', preset.bright)
    root.setProperty('--accent-rgb', preset.accentRgb)
    root.setProperty('--accent-bright-rgb', preset.brightRgb)
  }, [accent])

  return { theme, setTheme, accent, setAccent, fontset, setFontset }
}