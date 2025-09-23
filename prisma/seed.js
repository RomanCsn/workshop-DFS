const { PrismaClient, Role, Status, Service_type } = require( "../src/generated/prisma");

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.$transaction([
    prisma.performedService.deleteMany(),
    prisma.billing.deleteMany(),
    prisma.lesson.deleteMany(),
    prisma.horse.deleteMany(),
    prisma.session.deleteMany(),
    prisma.account.deleteMany(),
    prisma.verification.deleteMany(),
    prisma.user.deleteMany(),
  ]);
}

async function seedUsers() {
  const owner = await prisma.user.create({
    data: {
      firstName: "Olivia",
      lastName: "Martens",
      email: "olivia.owner@example.com",
      phone: "+33123450001",
      role: Role.OWNER,
      emailVerified: true,
    },
  });

  const monitor = await prisma.user.create({
    data: {
      firstName: "Marc",
      lastName: "Duval",
      email: "marc.monitor@example.com",
      phone: "+33123450002",
      role: Role.MONITOR,
    },
  });

  const customer = await prisma.user.create({
    data: {
      firstName: "Ines",
      lastName: "Roche",
      email: "ines.customer@example.com",
      phone: "+33123450003",
      role: Role.CUSTOMER,
    },
  });

  const admin = await prisma.user.create({
    data: {
      firstName: "Theo",
      lastName: "Lambert",
      email: "theo.admin@example.com",
      phone: "+33123450004",
      role: Role.ADMIN,
    },
  });

  return { owner, monitor, customer, admin };
}

async function seedHorses(ownerId) {
  const horse = await prisma.horse.create({
    data: {
      name: "Shadowfax",
      ownerId,
    },
  });

  return horse;
}

async function seedLessons(customerId, monitorId, horseId) {
  const introLesson = await prisma.lesson.create({
    data: {
      date: new Date("2024-05-01T09:00:00Z"),
      desc: "Introductory riding lesson",
      status: Status.FINISHED,
      customerId,
      monitorId,
      horseId,
    },
  });

  const upcomingLesson = await prisma.lesson.create({
    data: {
      date: new Date("2024-05-08T09:00:00Z"),
      desc: "Follow-up lesson for posture",
      status: Status.PENDING,
      customerId,
      monitorId,
      horseId,
    },
  });

  return { introLesson, upcomingLesson };
}

async function seedBilling(customerId, lessonId) {
  const billing = await prisma.billing.create({
    data: {
      date: new Date("2024-05-02T10:00:00Z"),
    },
  });

  await prisma.performedService.create({
    data: {
      billingId: billing.id,
      userId: customerId,
      serviceId: lessonId,
      amount: 45,
      serviceType: Service_type.LESSON,
    },
  });

  return billing;
}

async function seedSessions(userId) {
  await prisma.session.create({
    data: {
      id: "session-customer-1",
      token: "token-customer-1",
      userId,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      ipAddress: "127.0.0.1",
      userAgent: "seed-script",
    },
  });
}

async function seedAccount(userId) {
  await prisma.account.create({
    data: {
      id: "account-owner-credentials",
      accountId: "olivia-owner",
      providerId: "credentials",
      userId,
      password: "hashed-password",
    },
  });
}

async function seedVerification(identifier) {
  await prisma.verification.create({
    data: {
      id: "verification-owner-email",
      identifier,
      value: "123456",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });
}

async function main() {
  await clearDatabase();

  const { owner, monitor, customer } = await seedUsers();
  const horse = await seedHorses(owner.id);
  const { introLesson } = await seedLessons(customer.id, monitor.id, horse.id);

  await seedBilling(customer.id, introLesson.id);
  await seedSessions(customer.id);
  await seedAccount(owner.id);
  await seedVerification(owner.email);

  console.info("Database seeded successfully.");
}

main()
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
