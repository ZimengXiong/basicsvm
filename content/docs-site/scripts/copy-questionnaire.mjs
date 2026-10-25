import { cpSync, existsSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = fileURLToPath(
  new URL('../../../deliverables/questionnaire-site/', import.meta.url)
)
const destination = fileURLToPath(
  new URL('../.vitepress/dist/survey/', import.meta.url)
)

if (!existsSync(source)) {
  console.warn(`Questionnaire source not found, skipping /survey/: ${source}`)
  process.exit(0)
}

rmSync(destination, { recursive: true, force: true })
cpSync(source, destination, { recursive: true })

console.log('Copied the questionnaire to /survey/')
