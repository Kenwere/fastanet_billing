import { Router } from "express";
import { eq, and } from "drizzle-orm";
import { db, vouchersTable, packagesTable } from "@workspace/db";
import {
  ListVouchersQueryParams,
  ListVouchersResponse,
  GenerateVouchersBody,
  GetVoucherParams,
  GetVoucherResponse,
  DeleteVoucherParams,
} from "@workspace/api-zod";
import { randomBytes } from "crypto";

const router = Router();

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

router.get("/vouchers", async (req, res): Promise<void> => {
  const queryParams = ListVouchersQueryParams.safeParse(req.query);
  let query = db.select({
    id: vouchersTable.id,
    orgId: vouchersTable.orgId,
    packageId: vouchersTable.packageId,
    code: vouchersTable.code,
    status: vouchersTable.status,
    usedAt: vouchersTable.usedAt,
    usedByUserId: vouchersTable.usedByUserId,
    expiryDate: vouchersTable.expiryDate,
    packageName: packagesTable.name,
    createdAt: vouchersTable.createdAt,
  }).from(vouchersTable).leftJoin(packagesTable, eq(vouchersTable.packageId, packagesTable.id)).$dynamic();

  const conditions: ReturnType<typeof eq>[] = [];
  if (queryParams.success) {
    if (queryParams.data.orgId) conditions.push(eq(vouchersTable.orgId, queryParams.data.orgId));
    if (queryParams.data.status) conditions.push(eq(vouchersTable.status, queryParams.data.status));
  }
  if (conditions.length > 0) query = query.where(and(...conditions));
  const vouchers = await query.orderBy(vouchersTable.createdAt);
  res.json(ListVouchersResponse.parse(vouchers));
});

router.post("/vouchers", async (req, res): Promise<void> => {
  const parsed = GenerateVouchersBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { count, orgId, packageId, expiryDays } = parsed.data;
  const expiryDate = expiryDays ? new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000) : null;
  const rows = Array.from({ length: count }, () => ({
    orgId,
    packageId,
    code: `FN-${generateCode()}-${generateCode().slice(0, 4)}`,
    status: "unused" as const,
    expiryDate,
  }));
  const vouchers = await db.insert(vouchersTable).values(rows).returning();
  const [pkg] = await db.select().from(packagesTable).where(eq(packagesTable.id, packageId));
  const result = vouchers.map(v => ({ ...v, packageName: pkg?.name ?? null }));
  res.status(201).json(result);
});

router.get("/vouchers/:id", async (req, res): Promise<void> => {
  const params = GetVoucherParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [v] = await db.select({
    id: vouchersTable.id,
    orgId: vouchersTable.orgId,
    packageId: vouchersTable.packageId,
    code: vouchersTable.code,
    status: vouchersTable.status,
    usedAt: vouchersTable.usedAt,
    usedByUserId: vouchersTable.usedByUserId,
    expiryDate: vouchersTable.expiryDate,
    packageName: packagesTable.name,
    createdAt: vouchersTable.createdAt,
  }).from(vouchersTable).leftJoin(packagesTable, eq(vouchersTable.packageId, packagesTable.id)).where(eq(vouchersTable.id, params.data.id));
  if (!v) {
    res.status(404).json({ error: "Voucher not found" });
    return;
  }
  res.json(GetVoucherResponse.parse(v));
});

router.delete("/vouchers/:id", async (req, res): Promise<void> => {
  const params = DeleteVoucherParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [v] = await db.delete(vouchersTable).where(eq(vouchersTable.id, params.data.id)).returning();
  if (!v) {
    res.status(404).json({ error: "Voucher not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;
