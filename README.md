# Calculadora de sueldo líquido · Chile

Calcula el sueldo líquido a partir del sueldo imponible: AFP (10 % + comisión), salud (Fonasa o Isapre), seguro de cesantía e impuesto único de segunda categoría. Funciona 100 % en el navegador: no necesita servidor, base de datos ni dominio propio.

Hecha con **React + TypeScript + Vite + Tailwind CSS**.

## Cómo se mantiene al día

| Dato | Cómo se actualiza |
| --- | --- |
| **UF y UTM** | **Automático.** Se consultan en vivo a [mindicador.cl](https://mindicador.cl) cada vez que alguien abre la página (con caché de 6 horas). Si el servicio falla, se usa el último valor guardado en el navegador y, si no hay, el de respaldo. La página avisa cuando está usando un valor que no es en vivo. |
| **Topes imponibles, comisiones de AFP, tramos del impuesto** | Cambian pocas veces al año, así que viven en un solo archivo: [`src/config/parametros.json`](src/config/parametros.json). Editas el archivo, haces `git push` y Vercel publica la nueva versión sola. |

Como los tramos del impuesto están expresados en UTM (no en pesos), se ajustan solos cuando cambia la UTM; no hay que tocarlos cada mes.

### Cuándo revisar `parametros.json`

- **Enero / febrero**: la Superintendencia de Pensiones publica los nuevos topes imponibles (`topeImponibleUF`, `topeCesantiaUF`). Fuente: <https://www.spensiones.cl>.
- **Enero y julio** (aprox.): cambian las comisiones de las AFP (`afp[].comision`). Fuente: Superintendencia de Pensiones.
- Si la ley cambia las tasas o los tramos del impuesto (`tramosImpuesto`). Fuente: <https://www.sii.cl>.

Después de editar, actualiza también `revisadoEn` para que la página muestre la fecha de la última revisión.

## Desarrollo

```bash
npm install
npm run dev      # servidor local en http://localhost:5173
npm test         # pruebas del cálculo
npm run build    # genera la carpeta dist/
```

Las pruebas (`src/lib/calculo.test.ts`) verifican el cálculo contra ejemplos publicados, la continuidad de la tabla de impuesto en cada tramo, los topes y el caso de Isapre.

## Publicar en Vercel

1. Sube el proyecto a un repositorio de GitHub.
2. En [vercel.com/new](https://vercel.com/new), importa el repositorio. Vercel detecta Vite solo: no hay que cambiar nada.
3. Pulsa **Deploy**. Obtienes una URL gratis tipo `tu-proyecto.vercel.app`.

Desde ahí, cada `git push` a `main` publica automáticamente.

## Qué incluye y qué no

Incluye: AFP, comisión por AFP, salud (Fonasa 7 % o plan Isapre en UF, con piso del 7 %), seguro de cesantía (contrato indefinido o plazo fijo), topes imponibles, impuesto único de segunda categoría y haberes no imponibles.

No incluye: APV, asignación familiar, créditos por hijos, descuentos voluntarios, gratificación calculada automáticamente ni regímenes especiales. Es una estimación referencial; la liquidación oficial manda.

## Estructura

```
src/
  config/parametros.json   ← valores legales editables
  lib/calculo.ts           ← lógica del cálculo (pura, con pruebas)
  lib/indicadores.ts       ← consulta de UF y UTM con respaldo
  components/              ← formulario, resultado, pie de página
```
