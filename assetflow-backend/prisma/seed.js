const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Roles
  const roles = await prisma.role.createMany({
    data: [
      {
        name: "Admin",
        description: "System Administrator",
      },
      {
        name: "Manager",
        description: "Asset Manager",
      },
      {
        name: "Employee",
        description: "Regular Employee",
      },
    ],
    skipDuplicates: true,
  });

  console.log("Roles inserted successfully!");

  // Categories
  const laptopCategory = await prisma.category.upsert({
    where: {
      name: "Laptop",
    },
    update: {},
    create: {
      name: "Laptop",
      description: "Portable computers",
    },
  });

  const mobileCategory = await prisma.category.upsert({
    where: {
      name: "Mobile",
    },
    update: {},
    create: {
      name: "Mobile",
      description: "Mobile devices",
    },
  });

  console.log("Categories inserted successfully!");

  // Users
  const admin = await prisma.user.upsert({
    where: {
      email: "admin@assetflow.com",
    },
    update: {},
    create: {
      email: "admin@assetflow.com",
      passwordHash: "hashed_password",
      name: "Admin User",
    },
  });

  const employee = await prisma.user.upsert({
    where: {
      email: "employee@assetflow.com",
    },
    update: {},
    create: {
      email: "employee@assetflow.com",
      passwordHash: "hashed_password",
      name: "Employee User",
    },
  });

  console.log("Users inserted successfully!");
  // Assign roles to users

const adminRole = await prisma.role.findUnique({
  where: {
    name: "Admin",
  },
});

const employeeRole = await prisma.role.findUnique({
  where: {
    name: "Employee",
  },
});

await prisma.userRole.createMany({
  data: [
    {
      userId: admin.id,
      roleId: adminRole.id,
    },
    {
      userId: employee.id,
      roleId: employeeRole.id,
    },
  ],
  skipDuplicates: true,
});

console.log("User roles assigned successfully!");

  // Assets
  await prisma.asset.createMany({
    data: [
      {
        tag: "LAP-001",
        name: "Dell Latitude Laptop",
        description: "Development laptop",
        categoryId: laptopCategory.id,
      },
      {
        tag: "MOB-001",
        name: "iPhone 15",
        description: "Company mobile phone",
        categoryId: mobileCategory.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Assets inserted successfully!");

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });