import { useGetDashboardStats, useGetRevenueChart, useGetRouterHealth } from "@workspace/api-client-react";
import { Users, Router, CreditCard, Activity, TrendingUp, Wifi, Ticket, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const ORG_ID = 1;

function StatCard({ icon: Icon, label, value, sub, color }: { icon: typeof Users; label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-card border rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-muted-foreground font-medium">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color ?? "bg-primary/10"}`}>
          <Icon className={`w-4 h-4 ${color ? "text-white" : "text-primary"}`} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: stats, isLoading: loadingStats } = useGetDashboardStats({ orgId: ORG_ID });
  const { data: revenue, isLoading: loadingRevenue } = useGetRevenueChart({ orgId: ORG_ID, period: "daily" });
  const { data: routerHealth } = useGetRouterHealth({ orgId: ORG_ID });

  if (loadingStats) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border rounded-xl p-5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  const pieData = [
    { name: "Active", value: stats?.activeUsers ?? 0, color: "#f5c542" },
    { name: "Expired", value: stats?.expiredUsers ?? 0, color: "#e5e7eb" },
    { name: "Suspended", value: Math.max(0, (stats?.totalUsers ?? 0) - (stats?.activeUsers ?? 0) - (stats?.expiredUsers ?? 0)), color: "#f87171" },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
        <p className="text-muted-foreground text-sm mt-1">SpeedLink ISP — Real-time stats</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Users" value={stats?.totalUsers ?? 0} sub={`${stats?.activeUsers ?? 0} active`} />
        <StatCard icon={Router} label="Routers" value={stats?.totalRouters ?? 0} sub={`${stats?.onlineRouters ?? 0} online`} />
        <StatCard icon={CreditCard} label="Monthly Revenue" value={`KES ${(stats?.monthlyRevenue ?? 0).toLocaleString()}`} sub="This month" color="bg-green-500" />
        <StatCard icon={Activity} label="Active Sessions" value={stats?.activeSessions ?? 0} />
        <StatCard icon={TrendingUp} label="Total Revenue" value={`KES ${(stats?.totalRevenue ?? 0).toLocaleString()}`} />
        <StatCard icon={Ticket} label="Vouchers" value={stats?.totalVouchers ?? 0} sub={`${stats?.unusedVouchers ?? 0} unused`} />
        <StatCard icon={Wifi} label="Pending Payments" value={stats?.pendingPayments ?? 0} color="bg-amber-500" />
        <StatCard icon={Package} label="Packages" value={stats?.totalPackages ?? 0} />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Daily Revenue (Last 30 Days)</h2>
          {loadingRevenue ? (
            <div className="h-48 animate-pulse bg-muted rounded" />
          ) : revenue && revenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, "Revenue"]} />
                <Bar dataKey="amount" fill="#f5c542" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
              No revenue data yet
            </div>
          )}
        </div>

        {/* User status pie */}
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">User Status</h2>
          {pieData.length > 0 ? (
            <div>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number, name: string) => [v, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {pieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-medium">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">No user data</div>
          )}
        </div>
      </div>

      {/* Router health */}
      {routerHealth && routerHealth.length > 0 && (
        <div className="bg-card border rounded-xl p-5">
          <h2 className="font-semibold text-foreground mb-4">Router Health</h2>
          <div className="space-y-3">
            {routerHealth.map((r) => (
              <div key={r.routerId} className="flex items-center gap-4">
                <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === "online" ? "bg-green-500" : r.status === "offline" ? "bg-red-500" : "bg-yellow-500"}`} />
                <span className="text-sm font-medium flex-1">{r.routerName}</span>
                <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full"
                    style={{ width: `${r.uptimePercent}%`, background: r.status === "online" ? "#f5c542" : "#f87171" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground w-12 text-right">{r.uptimePercent}%</span>
                <span className={`text-xs font-medium w-14 text-right capitalize ${r.status === "online" ? "text-green-600" : r.status === "offline" ? "text-red-600" : "text-yellow-600"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
