import { Router } from "express";
import { eq, count, sum, and, gt, lt } from "drizzle-orm";
import { db, organizationsTable, ispUsersTable, routersTable, paymentsTable, vouchersTable, sessionsTable, packagesTable } from "@workspace/db";
import {
  GetDashboardStatsQueryParams,
  GetDashboardStatsResponse,
  GetRevenueChartQueryParams,
  GetRevenueChartResponse,
  GetRouterHealthQueryParams,
  GetRouterHealthResponse,
} from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/dashboard/stats", async (req, res): Promise<void> => {
  const queryParams = GetDashboardStatsQueryParams.safeParse(req.query);
  const orgId = queryParams.success ? queryParams.data.orgId : undefined;

  const userFilter = orgId ? eq(ispUsersTable.orgId, orgId) : undefined;
  const routerFilter = orgId ? eq(routersTable.orgId, orgId) : undefined;
  const paymentFilter = orgId ? eq(paymentsTable.orgId, orgId) : undefined;
  const voucherFilter = orgId ? eq(vouchersTable.orgId, orgId) : undefined;
  const sessionFilter = orgId ? eq(sessionsTable.orgId, orgId) : undefined;
  const packageFilter = orgId ? eq(packagesTable.orgId, orgId) : undefined;

  const [userStats] = await db.select({
    total: count(),
  }).from(ispUsersTable).where(userFilter);

  const [activeUsers] = await db.select({ count: count() }).from(ispUsersTable)
    .where(and(userFilter, eq(ispUsersTable.status, "active")));
  const [expiredUsers] = await db.select({ count: count() }).from(ispUsersTable)
    .where(and(userFilter, eq(ispUsersTable.status, "expired")));

  const [routerStats] = await db.select({ total: count() }).from(routersTable).where(routerFilter);
  const [onlineRouters] = await db.select({ count: count() }).from(routersTable)
    .where(and(routerFilter, eq(routersTable.status, "online")));

  const [revenueStats] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable)
    .where(and(paymentFilter, eq(paymentsTable.status, "paid")));

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const [monthlyRevenue] = await db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable)
    .where(and(paymentFilter, eq(paymentsTable.status, "paid"), gt(paymentsTable.paidAt, monthStart)));

  const [pendingPayments] = await db.select({ count: count() }).from(paymentsTable)
    .where(and(paymentFilter, eq(paymentsTable.status, "pending")));

  const [voucherStats] = await db.select({ total: count() }).from(vouchersTable).where(voucherFilter);
  const [unusedVouchers] = await db.select({ count: count() }).from(vouchersTable)
    .where(and(voucherFilter, eq(vouchersTable.status, "unused")));

  const [activeSessions] = await db.select({ count: count() }).from(sessionsTable)
    .where(and(sessionFilter, eq(sessionsTable.isActive, true)));

  const [packageStats] = await db.select({ total: count() }).from(packagesTable).where(packageFilter);

  const stats = {
    totalUsers: userStats?.total ?? 0,
    activeUsers: activeUsers?.count ?? 0,
    expiredUsers: expiredUsers?.count ?? 0,
    totalRouters: routerStats?.total ?? 0,
    onlineRouters: onlineRouters?.count ?? 0,
    totalRevenue: Number(revenueStats?.total ?? 0),
    monthlyRevenue: Number(monthlyRevenue?.total ?? 0),
    pendingPayments: pendingPayments?.count ?? 0,
    totalVouchers: voucherStats?.total ?? 0,
    unusedVouchers: unusedVouchers?.count ?? 0,
    activeSessions: activeSessions?.count ?? 0,
    totalPackages: packageStats?.total ?? 0,
  };

  res.json(GetDashboardStatsResponse.parse(stats));
});

router.get("/dashboard/revenue", async (req, res): Promise<void> => {
  const queryParams = GetRevenueChartQueryParams.safeParse(req.query);
  const orgId = queryParams.success ? queryParams.data.orgId : undefined;
  const period = queryParams.success ? (queryParams.data.period ?? "daily") : "daily";

  const paymentFilter = orgId ? and(eq(paymentsTable.orgId, orgId), eq(paymentsTable.status, "paid")) : eq(paymentsTable.status, "paid");

  let dateFormat: string;
  let daysBack: number;

  if (period === "monthly") {
    dateFormat = "YYYY-MM";
    daysBack = 365;
  } else if (period === "weekly") {
    dateFormat = "IYYY-IW";
    daysBack = 90;
  } else {
    dateFormat = "YYYY-MM-DD";
    daysBack = 30;
  }

  const since = new Date();
  since.setDate(since.getDate() - daysBack);

  const rows = await db.select({
    label: sql<string>`to_char(${paymentsTable.paidAt}, '${sql.raw(dateFormat)}')`,
    amount: sum(paymentsTable.amount),
    count: count(),
  }).from(paymentsTable)
    .where(and(paymentFilter, gt(paymentsTable.paidAt, since)))
    .groupBy(sql`to_char(${paymentsTable.paidAt}, '${sql.raw(dateFormat)}')`)
    .orderBy(sql`to_char(${paymentsTable.paidAt}, '${sql.raw(dateFormat)}')`);

  const result = rows.map(r => ({
    label: r.label ?? "",
    amount: Number(r.amount ?? 0),
    count: r.count ?? 0,
  }));

  res.json(GetRevenueChartResponse.parse(result));
});

router.get("/dashboard/router-health", async (req, res): Promise<void> => {
  const queryParams = GetRouterHealthQueryParams.safeParse(req.query);
  const orgId = queryParams.success ? queryParams.data.orgId : undefined;

  let query = db.select().from(routersTable).$dynamic();
  if (orgId) query = query.where(eq(routersTable.orgId, orgId));
  const routers = await query;

  const result = routers.map(r => {
    const uptimePercent = r.status === "online" ? 99.2 + Math.random() * 0.8 : r.status === "offline" ? 0 : 85 + Math.random() * 10;
    return {
      routerId: r.id,
      routerName: r.name,
      status: r.status,
      uptimePercent: Math.round(uptimePercent * 10) / 10,
      activeUsers: r.activeUsers,
      lastSeen: r.updatedAt?.toISOString() ?? null,
    };
  });

  res.json(GetRouterHealthResponse.parse(result));
});

export default router;
