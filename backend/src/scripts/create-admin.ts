import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import readline from 'readline';

const prisma = new PrismaClient();

function ask(question: string, hidden: boolean = false): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  console.log("=== SQUID PROTOCOL — SECURE ADMIN CREATION ===");

  let username = process.env.ADMIN_USERNAME || '';
  let password = process.env.ADMIN_PASSWORD || '';

  if (!username) {
    username = await ask("Enter Admin Username: ");
  }

  if (!password) {
    password = await ask("Enter Strong Admin Password (min 8 chars, 1 letter, 1 number): ");
  }

  if (!username || username.length < 3) {
    console.error("❌ Error: Admin username must be at least 3 characters.");
    process.exit(1);
  }

  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    console.error("❌ Error: Admin password must be at least 8 characters long and contain at least one letter and one number.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { username },
    update: {
      passwordHash,
      role: UserRole.ADMIN
    },
    create: {
      username,
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  // Create audit log entry
  await prisma.adminAuditLog.create({
    data: {
      adminUserId: admin.id,
      adminUsername: admin.username,
      action: "ADMIN_ACCOUNT_INITIALIZED",
      targetType: "USER",
      targetId: admin.id,
      details: { role: "ADMIN", initializedAt: new Date().toISOString() }
    }
  });

  console.log(`✅ Admin account '${username}' created/updated successfully with role ADMIN.`);
  console.log("⚠️ Keep these credentials secure. Never commit them to git.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
