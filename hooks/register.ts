import type { Register, ThemeColors, ThemeSetArgs } from 'claude-code'

import { checkColors, makeColors } from './make-colors.js'

// iOS's dark system colours, from Apple's HIG Color page as read 13 Nov 2026
// (values last updated 9 Jun 2025; the macOS 27 UI Kit agrees). Saved in
// design-research/apple/ios-system-colors. No named system colours reach a
// mod, so these are hex.
const IOS = {
  blue: '#0091ff',
  red: '#ff4245',
  green: '#30d158',
  yellow: '#ffd600',
  purple: '#db34f2',
}

// The colour exactly as given, on both shades the app reads in dark mode:
// tinted text (300; 400 for success) and filled controls (450; 200 for
// warning), since iOS uses one tint for both. The seed carries the colour's
// hue to the role's other shades (borders, backgrounds, hover).
const exactly = (hex: string, text: number, fill: number) => ({
  seed: hex,
  stops: { [text]: hex, [fill]: hex },
})

const { theme } = makeColors({
  label: 'Black',
  only: 'dark',
  // The app's own stronger borders and focus rings: cards share the chat
  // area's colour, so their outline is all that sets them apart on black.
  contrast: 'more',
  roles: {
    accent: exactly(IOS.blue, 300, 450),
    danger: exactly(IOS.red, 300, 450),
    success: exactly(IOS.green, 400, 450),
    // iOS has no warning colour; the design library pairs its Yellow with
    // caution (design-research/apple/macos-colors).
    warning: exactly(IOS.yellow, 300, 200),
    pro: exactly(IOS.purple, 300, 450),
  },
  dark: {
    gray: {
      anchors: {
        // Background #000000 and cells #1C1C1E are iOS's (systemGray6 dark);
        // #2C2C2E is systemGray5 dark.
        'surface-0': '#000000',
        // Desktop paints the chat area with surface-1 and the right panel and
        // message box with surface-2 (measured from an SDR screenshot,
        // 15 Nov 2026), so surface-1 stays black and the greys move up one.
        'surface-1': '#000000',
        'surface-2': '#1c1c1e',
        'surface-3': '#2c2c2e',
        // iOS's label (white) and secondary label, rgba(235, 235, 245, 0.6),
        // as it shows on black: #8D8D93, measured on iOS 27.0 (#98989F on a
        // #1C1C1E cell; design-research/apple/ios-system-colors). Muted text
        // takes secondary label too: tertiary label, documented at 30%, comes
        // out about 2.3:1 on black, and Desktop refuses a palette with text
        // under 3:1. The grey ramp's shades 200 to 400 come out the same.
        'text-primary': '#ffffff',
        'text-secondary': '#8d8d93',
        'text-muted': '#8d8d93',
      },
    },
  },
})

// White text on filled blue, red and purple controls, as iOS draws them
// (3.2 to 3.6:1, which Desktop still paints). Green and yellow keep the
// helper's black: white on them is under 3:1, and Desktop refuses a whole
// palette with text that low.
const COLORS: ThemeColors = {
  ...theme,
  inputs: {
    dark: {
      ...theme.inputs.dark,
      'role-accent-on': '#ffffff',
      'role-danger-on': '#ffffff',
      'role-pro-on': '#ffffff',
    },
  },
}

const LOOK: ThemeSetArgs = { colors: COLORS }

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const unpainted = checkColors(COLORS).find(line => line.startsWith("Desktop won't paint"))

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
