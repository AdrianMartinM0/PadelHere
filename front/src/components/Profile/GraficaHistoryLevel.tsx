import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

// Divide el array en tramos de color según si está por encima o por debajo del nivelActual
function splitIntoColoredSegments(
    data: { match: number, level: number }[],
    nivelActual: number
) {
    if (!data || data.length === 0) return [];
    const result: { color: "red" | "green", points: { match: number, level: number, isIntersection?: boolean }[] }[] = [];
    let currentColor: "red" | "green" =
        data[0].level < nivelActual ? "red" : "green";
    let currentPoints: { match: number, level: number, isIntersection?: boolean }[] = [{ ...data[0] }];

    for (let i = 1; i < data.length; ++i) {
        const prev = data[i - 1];
        const curr = data[i];
        if (
            (prev.level < nivelActual && curr.level >= nivelActual) ||
            (prev.level > nivelActual && curr.level < nivelActual)
        ) {
            const dx = curr.match - prev.match;
            const dy = curr.level - prev.level;
            const t = (nivelActual - prev.level) / dy;
            const matchAtCross = prev.match + t * dx;
            // Marca el punto de intersección
            const crossPoint = { match: matchAtCross, level: nivelActual, isIntersection: true };

            currentPoints.push(crossPoint);
            result.push({ color: currentColor, points: currentPoints });

            currentColor = currentColor === "red" ? "green" : "red";
            currentPoints = [crossPoint, { ...curr }];
        } else {
            currentPoints.push({ ...curr });
        }
    }
    result.push({ color: currentColor, points: currentPoints });
    return result;
}

// Custom dot: small blue cross, or a vertical blue line for intersection points
const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (typeof cx !== "number" || typeof cy !== "number") return null;

    if (payload && payload.isIntersection) {
        // Draw a small vertical blue line centered at (cx, cy)
        return (
            <line
                x1={cx}
                x2={cx}
                y1={cy - 10}
                y2="92%"
                stroke="red"
                strokeWidth={.5}
                style={{ filter: "drop-shadow(0 0 6px red)" }}
            />
        );
    }

};

// Custom tooltip: only show the first valid value, and skip intersections
const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (!active || !payload || !payload.length) return null;
    // Busca el primer valor válido que no sea un punto de intersección
    const firstValid = payload.find((p: any) => typeof p.value === "number" && !isNaN(p.value) && !(p.payload && p.payload.isIntersection));
    if (!firstValid) return null;
    return (
        <div style={{ background: "#fff", color: "#000", padding: 8, borderRadius: 6, border: "1px solid #ddd" }}>
            <div><b>Partido:</b> {label}</div>
            <div><b>Nivel:</b> {firstValid.value.toLocaleString()}</div>
        </div>
    );
};

interface GraficaHistoryLevelProps {
    id: string;
    level: number;
}

const GraficaHistoryLevel = ({ level, id }: GraficaHistoryLevelProps) => {
    const [history, setHistory] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetch(`http://localhost:8000/v1/history_level/user/${id}`)
            .then(res => res.json())
            .then(data => {
                setHistory(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    const nivelActual = level ?? 0;
    const chartData = history.map((level, idx) => ({
        match: idx + 1,
        level,
    }));

    const areaSegments = splitIntoColoredSegments(chartData, nivelActual);

    if (loading) return <div>Cargando gráfica...</div>;
    if (!history.length) return <div>No hay histórico de nivel disponible.</div>;

    return (
        <div style={{ width: "100%", height: 470 }}>
            <div style={{ color: "#000", fontWeight: 700, fontSize: 15, padding: "0 0 8px 4px" }}>
                Línea horizontal = Nivel actual del jugador
            </div>
            <ResponsiveContainer>
                <AreaChart className="p-1 pb- rounded-lg" data={chartData} style={{ background: "#0002" }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255)" />
                    <XAxis
                        dataKey="match"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        allowDecimals={false}
                        label={{ value: "Partido", position: "insideBottomRight", offset: -5, fill: "#000" }}
                        tick={{ fontSize: 12, fill: "#000" }}
                        stroke="#000"
                    />
                    <YAxis
                        domain={[0, 10000]}
                        ticks={[0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000]}
                        label={{ value: "Nivel", angle: -90, position: "insideLeft", fill: "#000" }}
                        tick={{ fontSize: 12, fill: "#000" }}
                        stroke="#000"
                    />

                    {/* Tooltip que ignora los puntos de intersección */}
                    <Tooltip content={CustomTooltip} />

                    {/* Áreas segmentadas, con borde superior visible y puntos en el borde */}
                    {areaSegments.map((seg, i) => (
                        <Area
                            key={i}
                            type="monotone"
                            dataKey="level"
                            data={seg.points}
                            stroke={seg.color === "red" ? "#d62b2b" : "#1d802b"}
                            strokeWidth={3}
                            fill={seg.color === "red" ? "#ffd6d6" : "#d3ffd6"}
                            isAnimationActive={false}
                            connectNulls
                            dot={(dotProps: any) => <CustomDot {...dotProps} />}
                            activeDot={false}
                        />
                    ))}
                    <ReferenceLine
                        y={nivelActual}
                        stroke="#000"
                        strokeDasharray="6 2"
                        strokeWidth={3}
                        ifOverflow="extendDomain"
                    />

                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GraficaHistoryLevel;