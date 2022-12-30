import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@prisma.io' },
    update: {},
    create: {
      email: 'alice@prisma.io',
      firstName: 'Alice',
      lastName: 'Galvin',
      role: 'CUSTOMER',
      id: 'abc123',
    },
  });
  const mateo = await prisma.user.upsert({
    where: { email: 'm@gmail.com' },
    update: {},
    create: {
      email: 'm@gmail.com',
      firstName: 'Mateo',
      lastName: 'Galić',
      role: 'CUSTOMER',
      id: 'NWDRpKttYDe40sGvyhdYeEcYu812',
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: 'bob@prisma.io' },
    update: {},
    create: {
      email: 'bob@prisma.io',
      firstName: 'Bob',
      lastName: 'Roger',
      role: 'LANDLORD',
      id: 'abc12345',
      properties: {
        create: createdProperties,
      },
    },
  });
  console.log({ alice, mateo, bob });
}

const createdProperties = [...Array(10).keys()].map((key) => ({
  name: `Ralph Ravi ${key + 1}`,
  featuredImageUrl:
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
  pricePerNight: 199.99 * (key + 1),
  latitude: 43.446999,
  longitude: 18.692384,
  description: 'Nice home!',
  address: 'Trg bana Josipa Jelačića 3, 10000, Zagreb, Croatia',
  persons: key + 1,
  gallery: [
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
    'https://res.cloudinary.com/dxn9yllna/image/upload/v1667420247/Houses/digital-marketing-agency-ntwrk-g39p1kDjvSY-unsplash_uxgmne.jpg',
  ],
}));

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
