import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, sessionsTable, ispUsersTable, routersTable, packagesTable } from "@workspace/db";
import {
  ListSessionsQueryParams,
  ListSessionsResponse,
  DisconnectSessionParams,
  DisconnectSessionResponse,
} from "@workspace/api-zod";

const router = Router();

router.get("/sessions", async (req, res): Promise<void> => {
  const queryParams = ListSessionsQueryParams.safeParse(req.query);
  let query = db.select({
    id: sessionsTable.id,
    orgId: sessionsTable.orgId,
    userId: sessionsTable.userId,
    routerId: sessionsTable.routerId,
    packageId: sessionsTable.packageId,
    macAddress: sessionsTable.macAddress,
    ipAddress: sessionsTable.ipAddress,
    type: sessionsTable.type,
    isActive: sessionsTable.isActive,
    startedAt: sessionsTable.startedAt,
    expiresAt: sessionsTable.expiresAt,
    endedAt: sessionsTable.endedAt,
    userName: ispUsersTable.fullName,
    routerName: routersTable.name,
    packageName: packagesTable.name,
  }).from(sessionsTable)
    .leftJoin(ispUsersTable, eq(sessionsTable.userId, ispUsersTable.id))
    .leftJoin(routersTable, eq(sessionsTable.routerId, routersTable.id))
    .leftJoin(packagesTable, eq(sessionsTable.packageId, packagesTable.id))
    .$dynamic();

  const conditions: ReturnType<typeof eq>[] = [];
  if (queryParams.success) {
    if (queryParams.data.orgId) conditions.push(eq(sessionsTable.orgId, queryParams.data.orgId));
    if (queryParams.data.active !== undefined) conditions.push(eq(sessionsTable.isActive, queryParams.data.active));
  }
  if (conditions.length > 0) query = query.where(and(...conditions));
  const sessions = await query.orderBy(sessionsTable.startedAt);
  res.json(ListSessionsResponse.parse(sessions));
});

router.post("/sessions/:id/disconnect", async (req, res): Promise<void> => {
  const params = DisconnectSessionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [session] = await db.update(sessionsTable)
    .set({ isActive: false, endedAt: new Date() })
    .where(eq(sessionsTable.id, params.data.id))
    .returning();
  if (!session) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  res.json(DisconnectSessionResponse.parse({ ...session, userName: null, routerName: null, packageName: null }));
});

export default router;
