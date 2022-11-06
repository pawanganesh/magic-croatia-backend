import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: "alice@prisma.io" },
    update: {},
    create: {
      email: "alice@prisma.io",
      password: "123456",
      firstName: "Alice",
      lastName: "Galvin",
      role: "CUSTOMER",
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: "bob@prisma.io" },
    update: {},
    create: {
      email: "bob@prisma.io",
      password: "123456",
      firstName: "Bob",
      lastName: "Roger",
      role: "LANDLORD",
      properties: {
        create: {
          name: "Ralph Ravi",
          featuredImageUrl:
            "https://res.cloudinary.com/dxn9yllna/image/upload/v1667420252/Houses/ralph-ravi-kayden-mR1CIDduGLc-unsplash_pvnaui.jpg",
          pricePerNight: 99.99,
          latitude: 43.446999,
          longitude: 16.692384,
          description: "Lovely home!",
        },
      },
    },
  });
  console.log({ alice, bob });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
