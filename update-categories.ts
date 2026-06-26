import { prisma } from './src/lib/prisma';

async function main() {
  const categories = await prisma.category.findMany();
  for (const cat of categories) {
    if (cat.name.toLowerCase() === 'zapatillas' || cat.slug === 'zapatillas') {
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: 'Árabes', slug: 'arabes' }
      });
      console.log('Renamed Zapatillas to Árabes');
    }
    if (cat.name.toLowerCase() === 'destacados' || cat.slug === 'destacados') {
      await prisma.category.update({
        where: { id: cat.id },
        data: { name: 'Diseñador', slug: 'disenador' }
      });
      console.log('Renamed Destacados to Diseñador');
    }
  }
}

main().catch(console.error);
