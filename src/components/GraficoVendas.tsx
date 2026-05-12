"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

type DadoDia = {
  dia: string;
  total: number;
};

export function GraficoVendas({ dados }: { dados: DadoDia[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={dados} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <XAxis
          dataKey="dia"
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#888", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `R$${v}`}
        />
        <Tooltip
          contentStyle={{
            background: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 8,
            fontSize: 12,
          }}
          formatter={(v) => [`R$ ${Number(v ?? 0).toFixed(2)}`, "Vendas"]}
          labelStyle={{ color: "#ccc" }}
          cursor={{ fill: "rgba(255,255,255,0.05)" }}
        />
        <Bar dataKey="total" radius={[4, 4, 0, 0]}>
          {dados.map((_, i) => (
            <Cell
              key={i}
              fill={i === dados.length - 1 ? "oklch(0.7 0.19 47)" : "oklch(0.4 0.12 47)"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
