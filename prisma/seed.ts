import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@talntstaffing.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "TStaff Admin",
      passwordHash,
      role: "ADMIN"
    }
  });

  // Never print the password: build logs are visible to anyone with access to the Vercel project.
  console.log(`Admin user ready: ${admin.email}`);

  // One-time admin password reset. Set ADMIN_RESET_PASSWORD in Vercel, redeploy,
  // sign in, then DELETE the variable (otherwise every deploy resets it again).
  const resetPassword = process.env.ADMIN_RESET_PASSWORD;
  if (resetPassword) {
    if (resetPassword.length < 10) {
      console.log("ADMIN_RESET_PASSWORD is shorter than 10 characters, so the password was NOT reset.");
    } else {
      await prisma.user.update({
        where: { id: admin.id },
        data: { passwordHash: await bcrypt.hash(resetPassword, 10), role: "ADMIN" }
      });
      console.log(`Admin password reset for ${admin.email}. Now delete ADMIN_RESET_PASSWORD from Vercel.`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
