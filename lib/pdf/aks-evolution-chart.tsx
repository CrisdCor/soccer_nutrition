import { Circle, Line, Polyline, Svg, Text, View } from "@react-pdf/renderer";
import type { ThresholdRange } from "@/lib/format";
import { COLORS } from "@/lib/pdf/styles";
import { buildAksChartGeometry } from "@/lib/reportes/aks-chart-model";
import type { PlayerAksHistoryPoint } from "@/lib/reportes/queries";

/**
 * Evolución del Índice AKS del jugador a través de TODAS sus valoraciones
 * (no solo la seleccionada para el resto del reporte). La matemática
 * (escalas, segmentos, coordenadas) vive en lib/reportes/aks-chart-model.ts,
 * compartida con el mismo gráfico del reporte Word (lib/docx/aks-chart-image.ts)
 * -- acá solo se dibuja, con las primitivas SVG nativas de
 * @react-pdf/renderer (Svg/Line/Polyline/Circle) en vez de rasterizar una
 * imagen: vector real dentro del PDF, no una captura. Recharts no puede
 * ejecutarse dentro de un documento PDF, así que no se reutiliza el
 * componente de pantalla (PlayerSummaryReport en el Dashboard) tal cual,
 * aunque sí su mismo criterio (líneas de referencia del umbral, sin
 * interpolar valoraciones sin AKS calculado).
 *
 * Las etiquetas de texto (eje X, umbral) se posicionan con <Text
 * position="absolute"> por fuera del <Svg> en vez de <Text> SVG nativo:
 * SVGTextProps de @react-pdf/renderer no tipa `fontSize`, y así se
 * reutiliza el mismo sistema de estilos de texto que el resto del PDF.
 *
 * El caller (PlayerPage) decide si se muestra -- se omite directamente
 * cuando el jugador tiene una sola valoración, acá no se vuelve a validar
 * esa condición.
 */
export function AksEvolutionChart({
  history,
  currentAssessmentId,
  threshold,
}: {
  history: PlayerAksHistoryPoint[];
  currentAssessmentId: string;
  threshold: ThresholdRange | null;
}) {
  const geometry = buildAksChartGeometry(history, currentAssessmentId, threshold);
  if (!geometry) return null;

  const { dimensions, axisY, segments, dataPoints, xLabels, thresholdLines } = geometry;
  const { width, height, axisLabelHeight, padding } = dimensions;

  return (
    <View style={{ width, height: height + axisLabelHeight }}>
      <View style={{ position: "relative", width, height }}>
        <Svg width={width} height={height}>
          <Line x1={padding.left} y1={axisY} x2={width - padding.right} y2={axisY} stroke={COLORS.border} strokeWidth={1} />

          {thresholdLines && (
            <>
              <Line
                x1={padding.left}
                y1={thresholdLines.high.y}
                x2={width - padding.right}
                y2={thresholdLines.high.y}
                stroke={COLORS.blue}
                strokeWidth={0.75}
                strokeDasharray="3 3"
              />
              <Line
                x1={padding.left}
                y1={thresholdLines.low.y}
                x2={width - padding.right}
                y2={thresholdLines.low.y}
                stroke={COLORS.blue}
                strokeWidth={0.75}
                strokeDasharray="3 3"
              />
            </>
          )}

          {segments.map((segment, index) => (
            <Polyline
              key={index}
              points={segment.map((point) => `${point.x},${point.y}`).join(" ")}
              fill="none"
              stroke={COLORS.red}
              strokeWidth={1.5}
            />
          ))}

          {dataPoints.map((point) => (
            <Circle key={point.id} cx={point.x} cy={point.y} r={point.isCurrent ? 3.2 : 2.2} fill={point.isCurrent ? COLORS.blue : COLORS.red} />
          ))}
        </Svg>

        {thresholdLines && (
          <>
            <Text style={{ position: "absolute", top: thresholdLines.high.y - 8, left: padding.left, fontSize: 6, color: COLORS.blue }}>
              {thresholdLines.high.label}
            </Text>
            <Text style={{ position: "absolute", top: thresholdLines.low.y + 2, left: padding.left, fontSize: 6, color: COLORS.blue }}>
              {thresholdLines.low.label}
            </Text>
          </>
        )}
      </View>

      <View style={{ position: "relative", width, height: axisLabelHeight }}>
        {xLabels.map((label) => {
          // Ancho fijo de 52pt centrado/alineado sobre el punto -- el
          // primer y último punto quedan pegados al borde del gráfico, así
          // que se alinean hacia adentro (start/end) en vez de centrarse,
          // o el texto se saldría del área dibujable y quedaría cortado.
          const left = label.anchor === "start" ? label.x : label.anchor === "end" ? label.x - 52 : label.x - 26;
          const textAlign = label.anchor === "start" ? "left" : label.anchor === "end" ? "right" : "center";
          return (
            <Text
              key={label.id}
              style={{
                position: "absolute",
                top: 2,
                left,
                width: 52,
                fontSize: 6,
                textAlign,
                color: label.isCurrent ? COLORS.blue : COLORS.muted,
              }}
            >
              {label.text}
            </Text>
          );
        })}
      </View>
    </View>
  );
}
