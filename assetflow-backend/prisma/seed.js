const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  await prisma.role.createMany({
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

  console.log(" Roles inserted successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });