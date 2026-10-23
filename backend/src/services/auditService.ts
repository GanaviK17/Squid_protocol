import { prisma } from '../prisma.js';

export async function logAdminAction(params: {
  adminUserId: string;
  adminUsername: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
}) {
  try {
    return await prisma.adminAuditLog.create({
      data: {
        adminUserId: params.adminUserId,
        adminUsername: params.adminUsername,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        details: params.details || {},
        ipAddress: params.ipAddress
      }
    });
  } catch (err) {
    console.error("Failed to write admin audit log:", err);
  }
}
