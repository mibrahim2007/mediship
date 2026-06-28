"use client"

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from "recharts"

interface TeamStat {
  id: string
  name: string
  area: string
  city: string
  target: number
  sales: number
  achievement: number | null
}

interface AreaStat {
  name: string
  city: string
  sales: number
  target: number
  teams: number
}

interface Props {
  teamStats: TeamStat[]
  areaStats: AreaStat[]
}

const TEAM_COLORS = ["#0d9488", "#0284c7", "#7c3aed", "#db2777", "#ea580c", "#16a34a"]

const fmtCurrency = (v: number) =>
  v >= 1_000_000
    ? `${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
    ? `${(v / 1_000).toFixed(0)}K`
    : String(v)

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1">
      <p className="font-semibold text-slate-700 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: PKR {Number(p.value).toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export function TeamComparisonCharts({ teamStats, areaStats }: Props) {
  const hasTeamData = teamStats.some((t) => t.sales > 0 || t.target > 0)
  const hasAreaData = areaStats.some((a) => a.sales > 0 || a.target > 0)

  return (
    <div className="space-y-8">
      {/* Team-wise Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Team-wise Sales vs Target</h2>
        <p className="text-xs text-slate-400 mb-5">Actual sales revenue vs monthly target per team</p>

        {!hasTeamData ? (
          <p className="text-sm text-slate-400 text-center py-10">No sales data yet. Record some sales orders to see comparison.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teamStats} margin={{ top: 4, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="sales" name="Sales" radius={[4, 4, 0, 0]}>
                {teamStats.map((_, i) => (
                  <Cell key={i} fill={TEAM_COLORS[i % TEAM_COLORS.length]} />
                ))}
              </Bar>
              <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* Achievement table */}
        {teamStats.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Team</th>
                  <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Area</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Sales (PKR)</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Target (PKR)</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Achievement</th>
                </tr>
              </thead>
              <tbody>
                {teamStats.map((t, i) => (
                  <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: TEAM_COLORS[i % TEAM_COLORS.length] }}
                        />
                        <span className="font-medium text-slate-800">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-slate-500">{t.area}{t.city ? ` · ${t.city}` : ""}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                      {t.sales.toLocaleString()}
                    </td>
                    <td className="px-4 py-2.5 text-right text-slate-500">
                      {t.target > 0 ? t.target.toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {t.achievement !== null ? (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          t.achievement >= 100 ? "bg-green-100 text-green-700" :
                          t.achievement >= 70  ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-600"
                        }`}>
                          {t.achievement}%
                        </span>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Area-wise Comparison */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-1">Area-wise Sales Comparison</h2>
        <p className="text-xs text-slate-400 mb-5">Total sales revenue aggregated by distribution area</p>

        {!hasAreaData ? (
          <p className="text-sm text-slate-400 text-center py-10">No area data to display.</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={areaStats} margin={{ top: 4, right: 20, left: 10, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                angle={-30}
                textAnchor="end"
                interval={0}
              />
              <YAxis tickFormatter={fmtCurrency} tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar dataKey="sales" name="Sales" fill="#0d9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {areaStats.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-2.5 text-xs text-slate-500 font-medium">Area</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Teams</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Total Sales (PKR)</th>
                  <th className="text-right px-4 py-2.5 text-xs text-slate-500 font-medium">Total Target (PKR)</th>
                </tr>
              </thead>
              <tbody>
                {areaStats
                  .sort((a, b) => b.sales - a.sales)
                  .map((a, i) => (
                    <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5 font-medium text-slate-800">
                        {a.name}{a.city ? <span className="text-slate-400 font-normal"> · {a.city}</span> : ""}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500">{a.teams}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-slate-900">
                        {a.sales.toLocaleString()}
                      </td>
                      <td className="px-4 py-2.5 text-right text-slate-500">
                        {a.target > 0 ? a.target.toLocaleString() : "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
