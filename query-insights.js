const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.industryInsight.findMany({
    select: { industry: true, growthRate: true, demandLevel: true, marketOutlook: true }
}).then(console.log).finally(() => prisma.$disconnect());
