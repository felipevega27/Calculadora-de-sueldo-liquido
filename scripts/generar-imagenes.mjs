// Convierte los SVG de esta carpeta a los PNG de public/ (redes sociales no aceptan SVG).
// Uso, solo cuando cambies un SVG:
//   npm i --no-save @resvg/resvg-js@2.6.2
//   node scripts/generar-imagenes.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const pares = [
  ['scripts/og.svg', 'public/og.png'],
  ['scripts/icono.svg', 'public/apple-touch-icon.png'],
]

for (const [origen, destino] of pares) {
  const png = new Resvg(readFileSync(origen, 'utf8'), { font: { loadSystemFonts: true } }).render().asPng()
  writeFileSync(destino, png)
  console.log(`${destino} (${png.length} bytes)`)
}
