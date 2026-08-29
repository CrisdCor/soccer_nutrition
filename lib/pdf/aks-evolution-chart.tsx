import { Circle, Line, Polyline, Svg, Text, View } from "@react-pdf/renderer";
import type { ThresholdRange } from "@/lib/format";
import { COLORS } from "@/lib/pdf/styles";
import type { PlayerAksHistoryPoint } from "@/lib/reportes/queries";

const CHART_WIDTH = 480;
const CHART_HEIGHT = 150;
const AXIS_LABEL_HEIGHT = 20;
const PADDING = { top: 16, right: 14, bottom: 22, left: 26 };

type Point = { x: number; y: number };

/**
 * Evolución del Índice AKS del jugador a través de TODAS sus valoraciones
 * (no solo la seleccionada para el resto del reporte) -- mismo criterio que
 * el gráfico "Evolución -- Índice AKS" de PlayerSummaryReport en el
 * Dashboard (components/dashboard/player-summary-report.tsx: líneas de
 * referencia del umbral configurado, sin interpolar valoraciones sin AKS
 * calculado). Recharts no puede ejecutarse dentro de un documento PDF, así
 * que esto se dibuja con las primitivas SVG nativas de
 * @react-pdf/renderer (Svg/Line/Polyline/Circle) en vez de rasterizar una
 * imagen -- vector real dentro del PDF, no una captura.
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
  const values = history.map((point) => point.aks_index).filter((value): value is number => value != null);
  const thresholdValues = threshold ? [threshold.low_cut, threshold.high_cut] : [];
  const allValues = [...values, ...thresholdValues];

  // Sin ningún valor (ni siquiera de umbral) para escalar el eje Y --
  // no hay nada que dibujar. No debería pasar en la práctica (PlayerPage
  // ya exige history.length > 1), pero evita un NaN si algún día sí pasa.
  if (allValues.length === 0) return null;

  const rawMin = Math.min(...allValues);
  const rawMax = Math.max(...allValues);
  // Margen del 12% para que puntos y líneas de referencia no queden pegados
  // al borde del gráfico.
  const span = rawMax - rawMin || 1;
  const yMin = rawMin - span * 0.12;
  const yMax = rawMax + span * 0.12;

  const innerWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const innerHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const axisY = PADDING.top + innerHeight;

  const xAt = (index: number) => (history.length > 1 ? PADDING.left + (index * innerWidth) / (history.length - 1) : PADDING.left + innerWidth / 2);
  const yAt = (value: number) => PADDING.top + innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

  // Un tramo de Polyline por corrida contigua de valores no nulos -- una
  // valoración sin AKS calculado corta la línea en vez de interpolar entre
  // las vecinas, igual que connectNulls=false (default) en el Dashboard.
  const segments: Point[][] = [];
  let current: Point[] = [];
  history.forEach((point, index) => {
    if (point.aks_index == null) {
      if (current.length > 0) segments.push(current);
      current = [];
      return;
    }
    current.push({ x: xAt(index), y: yAt(point.aks_index) });
  });
  if (current.length > 0) segments.push(current);

  return (
    <View style={{ width: CHART_WIDTH, height: CHART_HEIGHT + AXIS_LABEL_HEIGHT }}>
      <View style={{ position: "relative", width: CHART_WIDTH, height: CHART_HEIGHT }}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Line x1={PADDING.left} y1={axisY} x2={CHART_WIDTH - PADDING.right} y2={axisY} stroke={COLORS.border} strokeWidth={1} />

          {threshold && (
            <>
              <Line
                x1={PADDING.left}
                y1={yAt(threshold.high_cut)}
                x2={CHART_WIDTH - PADDING.right}
                y2={yAt(threshold.high_cut)}
                stroke={COLORS.blue}
                strokeWidth={0.75}
                strokeDasharray="3 3"
              />
              <Line
                x1={PADDING.left}
                y1={yAt(threshold.low_cut)}
                x2={CHART_WIDTH - PADDING.right}
                y2={yAt(threshold.low_cut)}
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

          {history.map((point, index) => {
            if (point.aks_index == null) return null;
            const isCurrent = point.id === currentAssessmentId;
            return (
              <Circle
                key={point.id}
                cx={xAt(index)}
                cy={yAt(point.aks_index)}
                r={isCurrent ? 3.2 : 2.2}
                fill={isCurrent ? COLORS.blue : COLORS.red}
              />
            );
          })}
        </Svg>

        {threshold && (
          <>
            <Text
              style={{ position: "absolute", top: yAt(threshold.high_cut) - 8, left: PADDING.left, fontSize: 6, color: COLORS.blue }}
            >
              {`Máx ${threshold.high_cut}`}
            </Text>
            <Text
              style={{ position: "absolute", top: yAt(threshold.low_cut) + 2, left: PADDING.left, fontSize: 6, color: COLORS.blue }}
            >
              {`Mín ${threshold.low_cut}`}
            </Text>
          </>
        )}
      </View>

      <View style={{ position: "relative", width: CHART_WIDTH, height: AXIS_LABEL_HEIGHT }}>
        {history.map((point, index) => (
          <Text
            key={point.id}
            style={{
              position: "absolute",
              top: 2,
              left: xAt(index) - 26,
              width: 52,
              fontSize: 6,
              textAlign: "center",
              color: point.id === currentAssessmentId ? COLORS.blue : COLORS.muted,
            }}
          >
            {point.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
