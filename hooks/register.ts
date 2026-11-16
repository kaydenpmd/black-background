import type { Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'

// Greys from iOS dark mode: systemBackground #000000, secondarySystemBackground
// #1C1C1E, tertiarySystemBackground #2C2C2E, label white. No named system
// colours reach a mod, so these are hex. Roles stay the app's own.
const { theme, problems } = makeColors({
  label: 'Black',
  only: 'dark',
  // The app's own stronger borders and focus rings: cards share the chat
  // area's colour, so their outline is all that sets them apart on black.
  contrast: 'more',
  dark: {
    gray: {
      anchors: {
        'surface-0': '#000000',
        // Desktop paints the chat area with surface-1 and the right panel and
        // message box with surface-2 (measured from an SDR screenshot,
        // 15 Nov 2026), so surface-1 stays black and the greys move up one.
        'surface-1': '#000000',
        'surface-2': '#1c1c1e',
        'surface-3': '#2c2c2e',
        'text-primary': '#ffffff',
        'text-secondary': '#c7c7cc',
        'text-muted': '#98989f',
      },
    },
  },
})

const LOOK: ThemeSetArgs = { colors: theme }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    const set = await $.theme.set(LOOK)

    if (!set.isDrawn) {
      $.ui.status(set.reason)
    }

    return next(e)
  })
}
