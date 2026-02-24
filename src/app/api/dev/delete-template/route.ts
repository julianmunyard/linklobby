// DEV-ONLY route — deletes a template .ts file and removes it from the registry.
// Gated behind NEXT_PUBLIC_DEV_TOOLS=true. Not available in production.

import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (process.env.NEXT_PUBLIC_DEV_TOOLS !== 'true') {
    return NextResponse.json({ error: 'Dev tools not enabled' }, { status: 403 })
  }

  try {
    const body = await req.json()
    const { templateId } = body as { templateId: string }

    if (!templateId) {
      return NextResponse.json({ error: 'templateId required' }, { status: 400 })
    }

    // Parse themeId and slug from templateId (e.g. "instagram-reels-cards" → themeId may be multi-hyphen)
    // We need to find the actual file by scanning the data directories
    const dataDir = path.join(process.cwd(), 'src', 'lib', 'templates', 'data')
    let foundFile: string | null = null
    let foundThemeDir: string | null = null
    let foundExportName: string | null = null

    // Read index.ts to find the import for this template
    const indexPath = path.join(process.cwd(), 'src', 'lib', 'templates', 'index.ts')
    let indexContent = fs.readFileSync(indexPath, 'utf-8')

    // Find the import line that references this templateId by searching all template files
    const themeDirs = fs.readdirSync(dataDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)

    for (const themeDir of themeDirs) {
      const themePath = path.join(dataDir, themeDir)
      const files = fs.readdirSync(themePath).filter(f => f.endsWith('.ts'))

      for (const file of files) {
        const filePath = path.join(themePath, file)
        const content = fs.readFileSync(filePath, 'utf-8')

        // Check if this file contains the templateId
        if (content.includes(`"id": "${templateId}"`) || content.includes(`"id":"${templateId}"`)) {
          foundFile = filePath
          foundThemeDir = themeDir

          // Extract export name from the file
          const exportMatch = content.match(/export const (\w+)/)
          if (exportMatch) {
            foundExportName = exportMatch[1]
          }
          break
        }
      }
      if (foundFile) break
    }

    if (!foundFile || !foundExportName) {
      return NextResponse.json({ error: `Template "${templateId}" not found on disk` }, { status: 404 })
    }

    // 1. Delete the template .ts file
    fs.unlinkSync(foundFile)

    // 2. Remove import line from index.ts
    const importPattern = new RegExp(`import \\{ ${foundExportName} \\} from '[^']+'\n?\n?`, 'g')
    indexContent = indexContent.replace(importPattern, '')

    // 3. Remove from ALL_TEMPLATES array
    const entryPattern = new RegExp(`\\s*${foundExportName},?\n?`, 'g')
    indexContent = indexContent.replace(entryPattern, '\n')

    // Clean up any double newlines
    indexContent = indexContent.replace(/\n{3,}/g, '\n\n')

    fs.writeFileSync(indexPath, indexContent, 'utf-8')

    // 4. Optionally delete the public/templates/{templateId}/ directory
    const assetsDir = path.join(process.cwd(), 'public', 'templates', templateId)
    if (fs.existsSync(assetsDir)) {
      fs.rmSync(assetsDir, { recursive: true, force: true })
    }

    return NextResponse.json({
      success: true,
      templateId,
      message: `Template "${templateId}" deleted. HMR will update the UI.`,
    })
  } catch (error) {
    console.error('[dev/delete-template] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
