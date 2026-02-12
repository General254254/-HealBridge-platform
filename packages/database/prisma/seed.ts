import { PrismaClient } from '../src/generated/index.js';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Conditions
    const cancerCondition = await prisma.condition.upsert({
        where: { category_name: { category: 'CANCER', name: 'Breast Cancer' } },
        update: {},
        create: {
            name: 'Breast Cancer',
            category: 'CANCER',
            description: 'Comprehensive guide to breast cancer awareness and treatment.',
        },
    });

    const lymeCondition = await prisma.condition.upsert({
        where: { category_name: { category: 'LYME', name: 'Chronic Lyme' } },
        update: {},
        create: {
            name: 'Chronic Lyme',
            category: 'LYME',
            description: 'Understanding long-term effects and management of Lyme disease.',
        },
    });

    const touretteCondition = await prisma.condition.upsert({
        where: { category_name: { category: 'TOURETTE', name: 'Tourette Syndrome' } },
        update: {},
        create: {
            name: 'Tourette Syndrome',
            category: 'TOURETTE',
            description: 'Support and strategies for managing Tourette Syndrome.',
        },
    });

    // 2. Resources
    const resources = [
        {
            title: 'Understanding Treatment Options',
            description: 'A comprehensive overview of modern treatment paths for cancer survivors.',
            contentType: 'ARTICLE',
            url: 'https://www.cancer.gov/about-cancer/treatment',
            tags: ['treatment', 'support', 'guides'],
            isVerified: true,
            conditionId: cancerCondition.id,
        },
        {
            title: 'Managing Lyme Symptoms',
            description: 'Daily management and nutritional support for chronic lyme patients.',
            contentType: 'VIDEO',
            url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
            tags: ['lifestyle', 'nutrition'],
            isVerified: true,
            conditionId: lymeCondition.id,
        },
        {
            title: 'Tourette Coping Mechanisms',
            description: 'Practical strategies for social situations and stress management.',
            contentType: 'PDF',
            url: 'https://tourette.org/resources/',
            tags: ['coping', 'social'],
            isVerified: true,
            conditionId: touretteCondition.id,
        },
    ];

    for (const r of resources) {
        const { conditionId, ...resourceData } = r;
        const resource = await prisma.resource.create({
            data: {
                ...resourceData,
                contentType: resourceData.contentType as any,
                conditions: {
                    create: {
                        conditionId: conditionId,
                    },
                },
            },
        });
        console.log(`Created resource: ${resource.title}`);
    }

    // 3. Forums & Threads
    const conditions = [cancerCondition, lymeCondition, touretteCondition];
    for (const condition of conditions) {
        const forum = await prisma.forum.upsert({
            where: { conditionId: condition.id },
            update: {},
            create: {
                conditionId: condition.id,
                name: `${condition.name} Support Group`,
                description: `A safe space for people with ${condition.name} to share experiences and find support.`,
                category: condition.category as any,
            },
        });

        // Add an initial thread
        await prisma.thread.create({
            data: {
                forumId: forum.id,
                authorId: 'system', // or any valid user ID if available
                title: `Welcome to the ${condition.name} forum!`,
                content: `This is a community-driven space for support, advice, and connection regarding ${condition.name}. Please follow our community guidelines and be supportive of one another.`,
                tags: ['welcome', 'support'],
            },
        }).catch(() => {
            // Might fail if 'system' user doesn't exist, which is fine for seeding logic
            console.warn(`Could not create welcome thread for ${condition.name} - Author ID mismatch?`);
        });

        console.log(`Created forum for: ${condition.name}`);
    }

    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
