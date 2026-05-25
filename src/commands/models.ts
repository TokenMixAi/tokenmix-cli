import chalk from 'chalk'
import { logger } from '../utils/logger.js'
import { listPublicModels, ApiModel } from '../api/client.js'

const TYPE_LABEL: Record<string, string> = {
  chat: 'Chat',
  embedding: 'Embedding',
  image: 'Image',
  audio: 'Audio',
  video: 'Video',
  completion: 'Completion',
}

// Match the platform-wide formatter: 6 decimals, trim trailing zeros.
function formatPrice(p: number | undefined): string {
  if (!p) return '-'
  return p.toFixed(6).replace(/\.?0+$/, '')
}

export interface ModelsOptions {
  type?: string
}

export async function modelsCommand(opts: ModelsOptions): Promise<void> {
  const all = await listPublicModels()
  const filtered = opts.type ? all.filter((m) => m.model_type === opts.type) : all
  if (filtered.length === 0) {
    logger.warn('No models match the filter.')
    return
  }

  const grouped = new Map<string, ApiModel[]>()
  for (const m of filtered) {
    const list = grouped.get(m.model_type) ?? []
    list.push(m)
    grouped.set(m.model_type, list)
  }

  for (const [type, list] of grouped) {
    console.log()
    console.log(chalk.bold(`${TYPE_LABEL[type] ?? type}  (${list.length})`))
    for (const m of list) {
      const id = chalk.cyan(m.short_id || m.model_id)
      const priceParts: string[] = []
      if (type === 'chat' || type === 'embedding' || type === 'audio' || type === 'completion') {
        priceParts.push(`in $${formatPrice(m.input_price)}/M`)
        priceParts.push(`out $${formatPrice(m.output_price)}/M`)
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
