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
  const firstNames = [
    "Alice", "Bob", "Charlie", "Diana", "Eva", "Frank", "Grace", "Henry", "Iris", "Jack",
    "Kate", "Liam", "Mia", "Noah", "Olivia", "Paul", "Quinn", "Rose", "Sam", "Tina",
    "Uma", "Victor", "Wendy", "Xavier", "Yara", "Zoe", "Adam", "Bella", "Carl", "Dora",
    "Ethan", "Fiona", "George", "Hannah", "Ivan", "Julia", "Kevin", "Luna", "Max", "Nina",
    "Oscar", "Penny", "Quentin", "Ruby", "Steve", "Tara", "Ulrich", "Vera", "Will", "Xara"
  ];

  const lastNames = [
    "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
    "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
    "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
    "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
    "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"
  ];

  const users = [];

  // Create main roles first
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
  users.push(owner);

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
  users.push(admin);

  // Create 50 monitors
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const monitor = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.monitor${i}@example.com`,
        phone: `+331234${String(i + 10).padStart(5, '0')}`,
        role: Role.MONITOR,
      },
    });
    users.push(monitor);
  }

  // Create 200 customers
  for (let i = 0; i < 200; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const customer = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.customer${i}@example.com`,
        phone: `+331235${String(i + 100).padStart(5, '0')}`,
        role: Role.CUSTOMER,
      },
    });
    users.push(customer);
  }

  return users;
}

async function seedHorses(owners) {
  const horseNames = [
    "Shadowfax", "Thunder", "Lightning", "Storm", "Blaze", "Spirit", "Midnight", "Star", "Aurora", "Phoenix",
    "Eclipse", "Diamond", "Ruby", "Sapphire", "Emerald", "Silver", "Golden", "Copper", "Pearl", "Jade",
    "Arrow", "Flash", "Bolt", "Comet", "Meteor", "Galaxy", "Nova", "Orion", "Stellar", "Cosmic",
    "Wind", "Breeze", "Gale", "Hurricane", "Tornado", "Typhoon", "Zephyr", "Mistral", "Sirocco", "Chinook",
    "Fire", "Flame", "Ember", "Spark", "Inferno", "Volcano", "Lava", "Magma", "Ash", "Coal",
    "Ice", "Snow", "Frost", "Crystal", "Glacier", "Avalanche", "Blizzard", "Tundra", "Arctic", "Polar",
    "Ocean", "Wave", "Tide", "Current", "Stream", "River", "Lake", "Bay", "Coral", "Reef",
    "Mountain", "Hill", "Peak", "Summit", "Valley", "Canyon", "Ridge", "Cliff", "Rock", "Stone",
    "Forest", "Tree", "Oak", "Pine", "Cedar", "Maple", "Willow", "Birch", "Aspen", "Redwood",
    "Desert", "Dune", "Oasis", "Mirage", "Cactus", "Mesa", "Plateau", "Badlands", "Savanna", "Prairie"
  ];

  const horses = [];
  
  // Create 150 horses, distributed among owners
  for (let i = 0; i < 150; i++) {
    const randomOwner = owners.find(u => u.role === Role.OWNER) || owners[0];
    const horseName = horseNames[Math.floor(Math.random() * horseNames.length)];
    
    const horse = await prisma.horse.create({
      data: {
        name: `${horseName}_${i + 1}`,
        ownerId: randomOwner.id,
      },
    });
    horses.push(horse);
  }

  return horses;
}

async function seedLessons(users, horses) {
  const customers = users.filter(u => u.role === Role.CUSTOMER);
  const monitors = users.filter(u => u.role === Role.MONITOR);
  
  const lessonDescriptions = [
    "Introductory riding lesson",
    "Basic equitation techniques",
    "Advanced dressage training",
    "Jumping fundamentals",
    "Trail riding preparation",
    "Horse care and grooming",
    "Balance and posture work",
    "Cantering techniques",
    "Western riding style",
    "Competition preparation",
    "Horse behavior understanding",
    "Safety protocols review",
    "Equipment maintenance",
    "Natural horsemanship",
    "Therapeutic riding session"
  ];

  const statuses = [Status.FINISHED, Status.PENDING, Status.CANCELLED];
  const lessons = [];

  // Create 500 lessons with random data
  for (let i = 0; i < 500; i++) {
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const randomMonitor = monitors[Math.floor(Math.random() * monitors.length)];
    const randomHorse = horses[Math.floor(Math.random() * horses.length)];
    const randomDesc = lessonDescriptions[Math.floor(Math.random() * lessonDescriptions.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Random date between 3 months ago and 2 months in the future
    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() - 3);
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 2);
    const randomDate = new Date(minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime()));

    const lesson = await prisma.lesson.create({
      data: {
        date: randomDate,
        desc: `${randomDesc} - Session ${i + 1}`,
        status: randomStatus,
        customerId: randomCustomer.id,
        monitorId: randomMonitor.id,
        horseId: randomHorse.id,
      },
    });
    lessons.push(lesson);
  }

  return lessons;
}

async function seedBilling(users, lessons, horses) {
  const customers = users.filter(u => u.role === Role.CUSTOMER);
  const monitors = users.filter(u => u.role === Role.MONITOR);
  const finishedLessons = lessons.filter(l => l.status === Status.FINISHED);
  const billingStatuses = ["PAYED", "UNPAYED"];
  
  const billings = [];

  // Create billing for finished lessons
  for (let i = 0; i < finishedLessons.length; i++) {
    const lesson = finishedLessons[i];
    const customer = customers.find(c => c.id === lesson.customerId);
    const randomStatus = billingStatuses[Math.floor(Math.random() * billingStatuses.length)];
    
    // Random date after the lesson date
    const billingDate = new Date(lesson.date);
    billingDate.setDate(billingDate.getDate() + Math.floor(Math.random() * 7) + 1);
    
    const billing = await prisma.billing.create({
      data: {
        date: billingDate,
        situation: randomStatus,
      },
    });

    // Random amount between 30-80 euros
    const amount = Math.floor(Math.random() * 51) + 30;

    await prisma.performedService.create({
      data: {
        billingId: billing.id,
        userId: customer.id,
        serviceId: lesson.id,
        amount,
        serviceType: Service_type.LESSON,
      },
    });

    billings.push(billing);
  }

  // Create some additional services (care services)
  for (let i = 0; i < 100; i++) {
    const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
    const randomStatus = billingStatuses[Math.floor(Math.random() * billingStatuses.length)];
    
    // Random date in the last 3 months
    const serviceDate = new Date();
    serviceDate.setMonth(serviceDate.getMonth() - Math.floor(Math.random() * 3));
    
    // Create a lesson first (since serviceId is required)
    const randomMonitor = monitors[Math.floor(Math.random() * monitors.length)];
    const randomHorse = horses[Math.floor(Math.random() * horses.length)];
    
    const careLesson = await prisma.lesson.create({
      data: {
        date: serviceDate,
        desc: `Care service - Session ${i + 1}`,
        status: Status.FINISHED,
        customerId: randomCustomer.id,
        monitorId: randomMonitor.id,
        horseId: randomHorse.id,
      },
    });
    
    const billing = await prisma.billing.create({
      data: {
        date: serviceDate,
        situation: randomStatus,
      },
    });

    // Amount for care services
    const amount = Math.floor(Math.random() * 51) + 20; // 20-70

    await prisma.performedService.create({
      data: {
        billingId: billing.id,
        userId: randomCustomer.id,
        serviceId: careLesson.id,
        amount,
        serviceType: Service_type.CARE,
      },
    });

    billings.push(billing);
  }

  return billings;
}

async function seedSessions(users) {
  const customers = users.filter(u => u.role === Role.CUSTOMER);
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
    "Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0"
  ];

  // Create sessions for 50 random customers
  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
    const randomIP = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    
    await prisma.session.create({
      data: {
        id: `session-${randomUser.role.toLowerCase()}-${i}`,
        token: `token-${randomUser.role.toLowerCase()}-${i}-${Math.random().toString(36).substring(7)}`,
        userId: randomUser.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 30) + 1)), // 1-30 days
        ipAddress: randomIP,
        userAgent: randomUserAgent,
      },
    });
  }
}

async function seedAccounts(users) {
  // Create accounts for first 30 users
  for (let i = 0; i < Math.min(30, users.length); i++) {
    const user = users[i];
    await prisma.account.create({
      data: {
        id: `account-${user.role.toLowerCase()}-${i}`,
        accountId: `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}-${i}`,
        providerId: "credentials",
        userId: user.id,
        password: `hashed-password-${Math.random().toString(36).substring(7)}`,
      },
    });
  }
}

async function seedVerifications(users) {
  // Create verifications for first 20 users
  for (let i = 0; i < Math.min(20, users.length); i++) {
    const user = users[i];
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    await prisma.verification.create({
      data: {
        id: `verification-${user.role.toLowerCase()}-${i}`,
        identifier: user.email,
        value: verificationCode,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * (Math.floor(Math.random() * 12) + 1)), // 1-12 hours
      },
    });
  }
}

async function main() {
  console.info("🗑️  Clearing existing database...");
  await clearDatabase();

  console.info("👥 Creating users...");
  const users = await seedUsers();
  console.info(`✅ Created ${users.length} users`);

  console.info("🐎 Creating horses...");
  const horses = await seedHorses(users);
  console.info(`✅ Created ${horses.length} horses`);

  console.info("📚 Creating lessons...");
  const lessons = await seedLessons(users, horses);
  console.info(`✅ Created ${lessons.length} lessons`);

  console.info("💰 Creating billing records...");
  const billings = await seedBilling(users, lessons, horses);
  console.info(`✅ Created ${billings.length} billing records`);

  console.info("🔐 Creating sessions...");
  await seedSessions(users);
  console.info("✅ Created 50 sessions");

  console.info("👤 Creating accounts...");
  await seedAccounts(users);
  console.info("✅ Created 30 accounts");

  console.info("✉️  Creating verifications...");
  await seedVerifications(users);
  console.info("✅ Created 20 verifications");

  console.info("🎉 Database seeded successfully with massive data!");
  console.info(`📊 Summary:
  - ${users.length} users (1 owner, 1 admin, 50 monitors, 200 customers)
  - ${horses.length} horses
  - ${lessons.length} lessons
  - ${billings.length} billing records
  - 50 active sessions
  - 30 user accounts
  - 20 email verifications`);

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