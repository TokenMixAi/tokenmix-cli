import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { listPublicModels, ApiModel } from '../api/client.js'
import { t } from '../i18n/index.js'

// Resolved at call time so it follows the active locale.
function typeLabel(type: string): string {
  switch (type) {
    case 'chat':
      return t('models.typeChat')
    case 'embedding':
      return t('models.typeEmbedding')
    case 'image':
      return t('models.typeImage')
    case 'audio':
      return t('models.typeAudio')
    case 'video':
      return t('models.typeVideo')
    case 'completion':
      return t('models.typeCompletion')
    default:
      return type
  }
}

// Match the platform-wide formatter: 6 decimals, trim trailing zeros.
// Distinguish an UNKNOWN price (undefined → "-") from a FREE model (0 → "0",
// rendered as "$0") - previously both showed "-", which reads as "unknown".
export function formatPrice(p: number | undefined): string {
  if (p === undefined || p === null) return '-'
  if (p === 0) return '0'
  return p.toFixed(6).replace(/\.?0+$/, '')
}

export interface ModelsOptions {
  type?: string
  search?: string
}

// Apply --type and --search filters. Exported for unit testing.
export function filterModels(all: ApiModel[], opts: ModelsOptions): ApiModel[] {
  let r = all
  if (opts.type) r = r.filter((m) => m.model_type === opts.type)
  if (opts.search) {
    const kw = opts.search.toLowerCase()
    r = r.filter((m) => (m.short_id || m.model_id || '').toLowerCase().includes(kw))
  }
  return r
}

export async function modelsCommand(opts: ModelsOptions): Promise<void> {
  const all = await listPublicModels()
  const filtered = filterModels(all, opts)
  if (filtered.length === 0) {
    logger.warn(t('models.none'))
    return
  }

  const grouped = new Map<string, ApiModel[]>()
  for (const m of filtered) {
    const list = grouped.get(m.model_type) ?? []
    list.push(m)
    grouped.set(m.model_type, list)
  }

  for (const [type, list] of grouped) {
    // Stable, readable order within a type (the API order is arbitrary).
    list.sort((a, b) =>
      (a.short_id || a.model_id || '').localeCompare(b.short_id || b.model_id || ''),
    )
    console.log()
    console.log(chalk.bold(`${typeLabel(type)}  (${list.length})`))
    for (const m of list) {
      const id = chalk.cyan(m.short_id || m.model_id)
      const priceParts: string[] = []
      if (type === 'chat' || type === 'embedding' || type === 'audio' || type === 'completion') {
        priceParts.push(`${t('models.in')} $${formatPrice(m.input_price)}/M`)
        priceParts.push(`${t('models.out')} $${formatPrice(m.output_price)}/M`)
      } else if (type === 'image') {
        priceParts.push(`$${formatPrice(m.image_price)}/img`)
      } else if (type === 'video') {
        priceParts.push(`$${formatPrice(m.video_price)}/s`)
      }
      console.log(`  ${id}  ${chalk.dim(priceParts.join(' · '))}`)
    }
  }
  console.log()
}
