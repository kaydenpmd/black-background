// Runs hooks/register.ts with a stand-in engine and checks the colours it sends.
// node --experimental-strip-types --no-warnings tools/check-colors.mjs
import { checkColors } from '../hooks/make-colors.js'

const { register } = await import('../hooks/register.ts')
const hooks = {}

register((event, ...rest) => {
  hooks[event] = rest.at(-1)
})

let sent
const $ = {
  theme: {
    set: async look => {
      sent = look
      return { isDrawn: true, requestId: 'check' }
    },
  },
  ui: { toast: text => console.log('toast:', text), status: () => {} },
}

await hooks['session.start']($, {}, async () => {})

const dark = sent.colors.inputs.dark

for (const role of ['accent', 'danger', 'success', 'warning', 'pro']) {
  console.log(role.padEnd(8), 'fill', dark[`role-${role}-fill`], 'on', dark[`role-${role}-on`])
}

const lines = checkColors(sent.colors)
const blocking = lines.filter(line => line.startsWith("Desktop won't paint"))

console.log(`${lines.length} contrast notes, ${blocking.length} that stop Desktop painting`)

for (const line of blocking) {
  console.log(line)
}
process.exitCode = blocking.length > 0 ? 1 : 0
