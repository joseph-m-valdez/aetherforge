// Copies Cesium's prebuilt static runtime assets (Workers, Assets, Widgets,
// ThirdParty) into public/cesium so Vite serves them at /cesium in both dev
// and production. We do this instead of vite-plugin-static-copy because that
// plugin's dev middleware loses to the SPA fallback under rolldown-vite (the
// worker .js files come back as text/html). public/ has no such ambiguity.
import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const cesiumBuild = resolve(here, '../node_modules/cesium/Build/Cesium')
const dest = resolve(here, '../public/cesium')

if (!existsSync(cesiumBuild)) {
  console.error(`[copy-cesium] not found: ${cesiumBuild} (is cesium installed?)`)
  process.exit(1)
}

rmSync(dest, { recursive: true, force: true })
mkdirSync(dest, { recursive: true })

for (const dir of ['Workers', 'Assets', 'Widgets', 'ThirdParty']) {
  cpSync(resolve(cesiumBuild, dir), resolve(dest, dir), { recursive: true })
}

console.log(`[copy-cesium] copied Cesium assets to ${dest}`)
