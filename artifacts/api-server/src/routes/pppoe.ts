import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, pppoeAccountsTable, packagesTable } from "@workspace/db";
import {
  ListPppoeAccountsQueryParams,
  ListPppoeAccountsResponse,
  CreatePppoeAccountBody,
  GetPppoeAccountParams,
  GetPppoeAccountResponse,
  UpdatePppoeAccountParams,
  UpdatePppoeAccountBody,
  UpdatePppoeAccountResponse,
  DeletePppoeAccountParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/pppoe-accounts", async (req, res): Promise<void> => {
  const queryParams = ListPppoeAccountsQueryParams.safeParse(req.query);
  let query = db.select().from(pppoeAccountsTable).$dynamic();
  if (queryParams.success && queryParams.data.orgId) {
    query = query.where(eq(pppoeAccountsTable.orgId, queryParams.data.orgId));
  }
  const accounts = await query.orderBy(pppoeAccountsTable.createdAt);
  const result = accounts.map(a => { const { passwordHash: _, ...rest } = a; return rest; });
  res.json(ListPppoeAccountsResponse.parse(result));
});

router.post("/pppoe-accounts", async (req, res): Promise<void> => {
  const parsed = CreatePppoeAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password, ...rest } = parsed.data;
  const [account] = await db.insert(pppoeAccountsTable).values({ ...rest, passwordHash: password }).returning();
  const { passwordHash: _, ...safeAccount } = account;
  res.status(201).json(GetPppoeAccountResponse.parse(safeAccount));
});

router.get("/pppoe-accounts/:id", async (req, res): Promise<void> => {
  const params = GetPppoeAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [account] = await db.select().from(pppoeAccountsTable).where(eq(pppoeAccountsTable.id, params.data.id));
  if (!account) {
    res.status(404).json({ error: "PPPoE account not found" });
    return;
  }
  const { passwordHash: _, ...safeAccount } = account;
  res.json(GetPppoeAccountResponse.parse(safeAccount));
});

router.patch("/pppoe-accounts/:id", async (req, res): Promise<void> => {
  const params = UpdatePppoeAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdatePppoeAccountBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password, ...rest } = parsed.data as Record<string, unknown> & { password?: string };
  const updateData: Record<string, unknown> = { ...rest };
  if (password) updateData.passwordHash = password;
  const [account] = await db.update(pppoeAccountsTable).set(updateData).where(eq(pppoeAccountsTable.id, params.data.id)).returning();
  if (!account) {
    res.status(404).json({ error: "PPPoE account not found" });
    return;
  }
  const { passwordHash: _, ...safeAccount } = account;
  res.json(UpdatePppoeAccountResponse.parse(safeAccount));
});

router.delete("/pppoe-accounts/:id", async (req, res): Promise<void> => {
  const params = DeletePppoeAccountParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [account] = await db.delete(pppoeAccountsTable).where(eq(pppoeAccountsTable.id, params.data.id)).returning();
  if (!account) {
    res.status(404).json({ error: "PPPoE account not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
