# Calculadora de sueldo líquido · Chile

Calcula el sueldo líquido a partir del sueldo imponible: AFP (10 % + comisión), salud (Fonasa o Isapre), seguro de cesantía e impuesto único de segunda categoría. Funciona 100 % en el navegador: no necesita servidor, base de datos ni dominio propio.

Tiene dos pestañas:

- **Sueldo líquido**: el cálculo principal.
- **Valor hora**: valor de la hora ordinaria y de la hora extra (fórmula de la Dirección del Trabajo, sobre el sueldo base y las horas del contrato), cuánto ganas por hora trabajada según tu líquido, y tu **valor hora real** si agregas los minutos de traslado.

El botón **Compartir** comparte un link con los datos en la URL (`?sueldo=2500000&afp=uno…`): quien lo abre ve el mismo cálculo. La URL se mantiene al día mientras escribes.

Hecha con **React + TypeScript + Vite + Tailwind CSS**.

## Cómo se mantiene al día

| Dato | Cómo se actualiza |
| --- | --- |
| **UF y UTM** | **Automático.** Se consultan en vivo a [mindicador.cl](https://mindicador.cl) cada vez que alguien abre la página (con caché de 6 horas). Si el servicio falla, se usa el último valor guardado en el navegador y, si no hay, el de respaldo. La página avisa cuando está usando un valor que no es en vivo. |
| **Topes imponibles, comisiones de AFP, tramos del impuesto** | Cambian pocas veces al año, así que viven en un solo archivo: [`src/config/parametros.json`](src/config/parametros.json). Editas el archivo, haces `git push` y Vercel publica la nueva versión sola. |

Como los tramos del impuesto están expresados en UTM (no en pesos), se ajustan solos cuando cambia la UTM; no hay que tocarlos cada mes.
