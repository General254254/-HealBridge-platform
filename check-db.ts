import { PrismaClient } from './packages/database/src/generated/index.js';

const prisma = new PrismaClient();

async function checkData() {
    console.log('--- Database Audit ---');
    const userCount = await prisma.user.count();
    const conditionCount = await prisma.condition.count();
    const forumCount = await prisma.forum.count();
    const resourceCount = await prisma.resource.count();

    console.log(`Users: ${userCount}`);
    console.log(`Conditions: ${conditionCount}`);
    console.log(`Forums: ${forumCount}`);
    console.log(`Resources: ${resourceCount}`);

    if (conditionCount > 0) {
        const conditions = await prisma.condition.findMany();
        console.log('\nConditions:');
        conditions.forEach(c => console.log(`- ${c.name} (${c.category}) [ID: ${c.id}]`));
    }

    if (forumCount > 0) {
        const forums = await prisma.forum.findMany({ include: { condition: true } });
        console.log('\nForums:');
        forums.forEach(f => console.log(`- ${f.name} (Condition: ${f.condition.name}) [ID: ${f.id}]`));
    }
}

checkData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
