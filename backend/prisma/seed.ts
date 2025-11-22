import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create venue
    const venue = await prisma.venue.create({
        data: {
            name: 'Knotting Hill Place',
            address: '123 Wedding Lane, Beverly Hills, CA'
        }
    });

    console.log('✅ Created venue:', venue.name);

    // Create product types
    const productTypes = await Promise.all([
        prisma.productType.create({
            data: { name: 'Draft Beer', description: 'Draft beers on tap' }
        }),
        prisma.productType.create({
            data: { name: 'Bottled Beer', description: 'Bottled and canned beers' }
        }),
        prisma.productType.create({
            data: { name: 'Wine', description: 'Red, white, and rosé wines' }
        }),
        prisma.productType.create({
            data: { name: 'Cocktails', description: 'Signature cocktails' }
        }),
        prisma.productType.create({
            data: { name: 'Spirits', description: 'Premium spirits' }
        })
    ]);

    console.log('✅ Created product types');

    // Create products
    const products = await Promise.all([
        // Beers
        prisma.product.create({
            data: {
                name: 'Bud Light',
                category: 'beer',
                price: 5.50,
                quantity: 100,
                venueId: venue.id,
                productTypeId: productTypes[1].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Heineken',
                category: 'beer',
                price: 6.00,
                quantity: 80,
                venueId: venue.id,
                productTypeId: productTypes[1].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'IPA Draft',
                category: 'beer',
                price: 7.50,
                quantity: 50,
                venueId: venue.id,
                productTypeId: productTypes[0].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Guinness',
                category: 'beer',
                price: 8.00,
                quantity: 40,
                venueId: venue.id,
                productTypeId: productTypes[0].id
            }
        }),

        // Wines
        prisma.product.create({
            data: {
                name: 'Cabernet Sauvignon',
                category: 'wine',
                price: 12.00,
                quantity: 30,
                venueId: venue.id,
                productTypeId: productTypes[2].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Chardonnay',
                category: 'wine',
                price: 11.00,
                quantity: 35,
                venueId: venue.id,
                productTypeId: productTypes[2].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Prosecco',
                category: 'wine',
                price: 10.00,
                quantity: 45,
                venueId: venue.id,
                productTypeId: productTypes[2].id
            }
        }),

        // Cocktails
        prisma.product.create({
            data: {
                name: 'Moscow Mule',
                category: 'cocktail',
                price: 14.00,
                quantity: 60,
                venueId: venue.id,
                productTypeId: productTypes[3].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Margarita',
                category: 'cocktail',
                price: 13.00,
                quantity: 55,
                venueId: venue.id,
                productTypeId: productTypes[3].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Old Fashioned',
                category: 'cocktail',
                price: 15.00,
                quantity: 40,
                venueId: venue.id,
                productTypeId: productTypes[3].id
            }
        }),

        // Spirits
        prisma.product.create({
            data: {
                name: 'Tito\'s Vodka',
                category: 'spirit',
                price: 9.00,
                quantity: 70,
                venueId: venue.id,
                productTypeId: productTypes[4].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Hendricks Gin',
                category: 'spirit',
                price: 10.00,
                quantity: 55,
                venueId: venue.id,
                productTypeId: productTypes[4].id
            }
        }),
        prisma.product.create({
            data: {
                name: 'Jameson Whiskey',
                category: 'spirit',
                price: 11.00,
                quantity: 60,
                venueId: venue.id,
                productTypeId: productTypes[4].id
            }
        })
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create event packages
    const packages = await Promise.all([
        prisma.eventPackage.create({
            data: {
                name: 'Silver Package',
                description: 'Basic wedding package with standard bar',
                basePrice: 45.00,
                minGuests: 50,
                maxGuests: 150,
                isActive: true
            }
        }),
        prisma.eventPackage.create({
            data: {
                name: 'Gold Package',
                description: 'Premium wedding package with full bar',
                basePrice: 65.00,
                minGuests: 75,
                maxGuests: 200,
                isActive: true
            }
        }),
        prisma.eventPackage.create({
            data: {
                name: 'Platinum Package',
                description: 'Luxury wedding package with top-shelf bar',
                basePrice: 85.00,
                minGuests: 100,
                maxGuests: 300,
                isActive: true
            }
        })
    ]);

    console.log(`✅ Created ${packages.length} event packages`);

    // Create sample user
    const user = await prisma.user.create({
        data: {
            name: 'Admin User',
            email: 'admin@knottinghill.com',
            pin: '1234',
            role: 'admin',
            venueId: venue.id
        }
    });

    console.log('✅ Created admin user');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - 1 Venue`);
    console.log(`   - ${productTypes.length} Product Types`);
    console.log(`   - ${products.length} Products`);
    console.log(`   - ${packages.length} Event Packages`);
    console.log(`   - 1 Admin User`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
