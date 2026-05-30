#!/usr/bin/env node
// Reads `tokenmix kilo` output on stdin, extracts the JSON snippet, validates it.
// Exit 0 = valid, 1 = invalid. Used by the e2e CI scripts.
let s = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', (d) => (s += d))
process.stdin.on('end', () => {
  const m = s.match(/\{[^{}]*openAiBaseUrl[^{}]*\}/s)
  if (!m) {
    console.error('validate-kilo: no JSON object with openAiBaseUrl found')
    process.exit(1)
  }
  let o
  try {
    o = JSON.parse(m[0])
  } catch (e) {
    console.error('validate-kilo: JSON did not parse:', e.message)
    process.exit(1)
  }
  const checks = {
    provider: o.provider === 'openai-compatible',
    baseUrl: typeof o.openAiBaseUrl === 'string' && /\/v1$/.test(o.openAiBaseUrl),
    apiKey: typeof o.openAiApiKey === 'string' && o.openAiApiKey.startsWith('sk-tm-'),
    model: typeof o.defaultModelId === 'string' && o.defaultModelId.length > 0,
  }
  const failed = Object.entries(checks).filter(([, v]) => !v).map(([k]) => k)
  if (failed.length) {
    console.error('validate-kilo: failed checks:', failed.join(', '))
    process.exit(1)
  }
  console.log('validate-kilo: OK (provider/baseUrl/apiKey/model all valid)')
  process.exit(0)
})
