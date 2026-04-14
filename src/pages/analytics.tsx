import { useState } from "react";
import { useGetRevenueChart, useGetRouterHealth, useGetDashboardStats } from "@workspace/api-client-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { Button } from "@/components/ui/button";

const ORG_ID = 1;

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const { data: revenue, isLoading: loadingRevenue } = useGetRevenueChart({ orgId: ORG_ID, period });
  const { data: routerHealth } = useGetRouterHealth({ orgId: ORG_ID });
  const { data: stats } = useGetDashboardStats({ orgId: ORG_ID });

  const uptimeData = routerHealth?.map(r => ({
    name: r.routerName,
    uptime: r.uptimePercent,
    downtime: Math.max(0, 100 - r.uptimePercent),
  })) ?? [];

  const userStatusData = [
    { name: "Active", value: stats?.activeUsers ?? 0, color: "#f5c542" },
    { name: "Expired", value: stats?.expiredUsers ?? 0, color: "#94a3b8" },
    { name: "Suspended", value: Math.max(0, (stats?.totalUsers ?? 0) - (stats?.activeUsers ?? 0) - (stats?.expiredUsers ?? 0)), color: "#f87171" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Revenue trends, user growth, and network performance</p>
      </div>

      {/* Revenue chart */}
      <div className="bg-card border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Revenue Over Time</h2>
          <div className="flex gap-2">
            {(["daily", "weekly", "monthly"] as const).map(p => (
              <Button key={p} variant={period === p ? "default" : "outline"} size="sm" onClick={() => setPeriod(p)}
                className={period === p ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""}
                data-testid={`button-period-${p}`}>
                <span className="capitalize">{p}</span>
              </Button>
            ))}
          </div>
        </div>
        {loadingRevenue ? (
          <div className="h-64 animate-pulse bg-muted rounded" />
        ) : revenue && revenue.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f5c542" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f5c542" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="amount" stroke="#f5c542" fill="url(#colorRevenue)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No revenue data for this period
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* User status pie */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">User Status Distribution</h2>
          {userStatusData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={userStatusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {userStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                {userStatusData.map(d => (
                  <div key={d.name} className="flex items-center gap-1.5 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-48 flex items-center justify-center text-muted-foreground">No user data</div>}
        </div>

        {/* Router uptime bar chart */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Router Uptime vs Downtime (%)</h2>
          {uptimeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={uptimeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="uptime" fill="#f5c542" radius={[0, 3, 3, 0]} name="Uptime %" />
                <Bar dataKey="downtime" fill="#f87171" radius={[0, 3, 3, 0]} name="Downtime %" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground">No router data</div>
          )}
        </div>
      </div>

      {/* Payment count chart */}
      {revenue && revenue.length > 0 && (
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold mb-4">Transaction Count Over Time</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [v, "Transactions"]} />
              <Bar dataKey="count" fill="#1e293b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
