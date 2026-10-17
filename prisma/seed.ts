import { PrismaClient, OrderStatus } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpiando datos existentes en la base de datos...');
  await prisma.sale.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log('Generando 500 clientes...');
  const customersData = Array.from({ length: 500 }).map(() => ({
    name: faker.person.fullName(),
    email: faker.internet.email(),
  }));
  await prisma.customer.createMany({ data: customersData });
  const customers = await prisma.customer.findMany({ select: { id: true } });

  console.log('Generando 200 productos...');
  const categories = ['Electrónica', 'Ropa', 'Hogar', 'Deportes', 'Juguetes'];
  const productsData = Array.from({ length: 200 }).map(() => ({
    name: faker.commerce.productName(),
    category: faker.helpers.arrayElement(categories),
    price: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
    stock: faker.number.int({ min: 0, max: 500 }),
  }));
  await prisma.product.createMany({ data: productsData });
  const products = await prisma.product.findMany({ select: { id: true, price: true } });

  console.log('Inyectando 10,000 ventas correlacionadas en lotes...');
  const BATCH_SIZE = 2000;
  const TOTAL_SALES = 10000;
  const statuses: OrderStatus[] = [
    OrderStatus.PENDING,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
  ];

  for (let i = 0; i < TOTAL_SALES; i += BATCH_SIZE) {
    const salesBatch = Array.from({ length: BATCH_SIZE }).map(() => {
      const randomCustomer = faker.helpers.arrayElement(customers);
      const randomProduct = faker.helpers.arrayElement(products);
      const quantity = faker.number.int({ min: 1, max: 5 });
      const totalAmount = randomProduct.price * quantity;

      return {
        customerId: randomCustomer.id,
        productId: randomProduct.id,
        quantity,
        totalAmount,
        status: faker.helpers.arrayElement(statuses),
        createdAt: faker.date.past({ years: 1 }),
      };
    });

    await prisma.sale.createMany({ data: salesBatch });
    console.log(`Progreso: ${i + BATCH_SIZE} / ${TOTAL_SALES} ventas insertadas.`);
  }

  console.log('¡Siembra completada con exito! Se insertaron mas de 10,000 registros correlacionados.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });