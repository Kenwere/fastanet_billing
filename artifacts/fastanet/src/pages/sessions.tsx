import { useListSessions, useDisconnectSession, getListSessionsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Activity, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const ORG_ID = 1;

export default function SessionsPage() {
  const { data: sessions, isLoading } = useListSessions({ orgId: ORG_ID });
  const disconnectSession = useDisconnectSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDisconnect = async (id: number) => {
    await disconnectSession.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListSessionsQueryKey() });
    toast({ title: "Session disconnected" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Active Sessions</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and manage live internet sessions</p>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">User</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Router</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">IP Address</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Started</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Expires</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>
              ))
            ) : sessions?.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-2 opacity-30" />
                No sessions
              </td></tr>
            ) : (
              sessions?.map(s => (
                <tr key={s.id} className="border-b hover:bg-muted/20" data-testid={`row-session-${s.id}`}>
                  <td className="px-4 py-3 font-medium">{s.userName ?? "Unknown"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.routerName ?? "—"}</td>
                  <td className="px-4 py-3 font-mono text-xs">{s.ipAddress ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${s.type === "hotspot" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {s.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(s.startedAt).toLocaleTimeString()}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{s.expiresAt ? new Date(s.expiresAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3">
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${s.isActive ? "text-green-600" : "text-muted-foreground"}`}>
                      <div className={`w-2 h-2 rounded-full ${s.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      {s.isActive ? "Active" : "Ended"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.isActive && (
                      <Button variant="outline" size="sm" onClick={() => handleDisconnect(s.id)} disabled={disconnectSession.isPending} data-testid={`button-disconnect-session-${s.id}`}>
                        <WifiOff className="w-3 h-3 mr-1" />
                        Disconnect
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
