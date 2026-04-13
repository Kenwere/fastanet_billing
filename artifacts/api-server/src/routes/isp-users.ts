import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, ispUsersTable, packagesTable } from "@workspace/db";
import {
  ListIspUsersQueryParams,
  ListIspUsersResponse,
  CreateIspUserBody,
  GetIspUserParams,
  GetIspUserResponse,
  UpdateIspUserParams,
  UpdateIspUserBody,
  UpdateIspUserResponse,
  DeleteIspUserParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/isp-users", async (req, res): Promise<void> => {
  const queryParams = ListIspUsersQueryParams.safeParse(req.query);
  let query = db.select({
    id: ispUsersTable.id,
    orgId: ispUsersTable.orgId,
    routerId: ispUsersTable.routerId,
    packageId: ispUsersTable.packageId,
    fullName: ispUsersTable.fullName,
    phone: ispUsersTable.phone,
    email: ispUsersTable.email,
    macAddress: ispUsersTable.macAddress,
    ipAddress: ispUsersTable.ipAddress,
    username: ispUsersTable.username,
    status: ispUsersTable.status,
    expiryDate: ispUsersTable.expiryDate,
    packageName: packagesTable.name,
    createdAt: ispUsersTable.createdAt,
  }).from(ispUsersTable).leftJoin(packagesTable, eq(ispUsersTable.packageId, packagesTable.id)).$dynamic();

  const conditions: ReturnType<typeof eq>[] = [];
  if (queryParams.success) {
    if (queryParams.data.orgId) conditions.push(eq(ispUsersTable.orgId, queryParams.data.orgId));
    if (queryParams.data.status) conditions.push(eq(ispUsersTable.status, queryParams.data.status));
  }
  if (conditions.length > 0) query = query.where(and(...conditions));

  const users = await query.orderBy(ispUsersTable.createdAt);
  res.json(ListIspUsersResponse.parse(users));
});

router.post("/isp-users", async (req, res): Promise<void> => {
  const parsed = CreateIspUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.insert(ispUsersTable).values(parsed.data).returning();
  let packageName: string | null = null;
  if (user.packageId) {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, user.packageId));
    packageName = pkg?.name ?? null;
  }
  res.status(201).json(GetIspUserResponse.parse({ ...user, packageName }));
});

router.get("/isp-users/:id", async (req, res): Promise<void> => {
  const params = GetIspUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.select({
    id: ispUsersTable.id,
    orgId: ispUsersTable.orgId,
    routerId: ispUsersTable.routerId,
    packageId: ispUsersTable.packageId,
    fullName: ispUsersTable.fullName,
    phone: ispUsersTable.phone,
    email: ispUsersTable.email,
    macAddress: ispUsersTable.macAddress,
    ipAddress: ispUsersTable.ipAddress,
    username: ispUsersTable.username,
    status: ispUsersTable.status,
    expiryDate: ispUsersTable.expiryDate,
    packageName: packagesTable.name,
    createdAt: ispUsersTable.createdAt,
  }).from(ispUsersTable).leftJoin(packagesTable, eq(ispUsersTable.packageId, packagesTable.id)).where(eq(ispUsersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetIspUserResponse.parse(user));
});

router.patch("/isp-users/:id", async (req, res): Promise<void> => {
  const params = UpdateIspUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateIspUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db.update(ispUsersTable).set(parsed.data).where(eq(ispUsersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  let packageName: string | null = null;
  if (user.packageId) {
    const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, user.packageId));
    packageName = pkg?.name ?? null;
  }
  res.json(UpdateIspUserResponse.parse({ ...user, packageName }));
});

router.delete("/isp-users/:id", async (req, res): Promise<void> => {
  const params = DeleteIspUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [user] = await db.delete(ispUsersTable).where(eq(ispUsersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
