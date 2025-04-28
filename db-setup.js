// Database setup script using pg library
const { Client } = require('pg');

// Connection parameters from .env file
const client = new Client({
  user: 'postgres.roprgzjenvpfckgpwysg',
  password: 'Vasukp@2312',
  host: 'aws-0-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  ssl: {
    rejectUnauthorized: false
  }
});

// SQL to create all tables
const createTableSQL = `
-- Drop tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS "OrderItem" CASCADE;
DROP TABLE IF EXISTS "Order" CASCADE;
DROP TABLE IF EXISTS "Search" CASCADE;
DROP TABLE IF EXISTS "CartItem" CASCADE;
DROP TABLE IF EXISTS "Cart" CASCADE;
DROP TABLE IF EXISTS "Plant" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE "User" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) UNIQUE NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "phoneNumber" VARCHAR(255),
  "profileImage" VARCHAR(255),
  "address" TEXT,
  "bio" TEXT,
  "role" VARCHAR(50) NOT NULL DEFAULT 'USER',
  "lastLogin" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Plant table
CREATE TABLE "Plant" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(255) NOT NULL,
  "nameHi" VARCHAR(255) NOT NULL,
  "nameGu" VARCHAR(255) NOT NULL,
  "scientificName" VARCHAR(255) NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "image" VARCHAR(255) NOT NULL,
  "fallbackImage" VARCHAR(255) NOT NULL,
  "category" VARCHAR(100) NOT NULL,
  "difficulty" VARCHAR(50) NOT NULL,
  "light" VARCHAR(50) NOT NULL,
  "water" VARCHAR(50) NOT NULL,
  "petFriendly" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create Cart table
CREATE TABLE "Cart" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID UNIQUE NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create CartItem table
CREATE TABLE "CartItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "cartId" UUID NOT NULL,
  "plantId" UUID NOT NULL,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE,
  FOREIGN KEY ("plantId") REFERENCES "Plant"("id"),
  UNIQUE ("cartId", "plantId")
);

-- Create Search table
CREATE TABLE "Search" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "query" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create Order table
CREATE TABLE "Order" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID NOT NULL,
  "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  "total" DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create OrderItem table
CREATE TABLE "OrderItem" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "orderId" UUID NOT NULL,
  "plantId" UUID NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" DECIMAL(10, 2) NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("plantId") REFERENCES "Plant"("id"),
  UNIQUE ("orderId", "plantId")
);

-- Create indexes for performance
CREATE INDEX idx_user_email ON "User"("email");
CREATE INDEX idx_plant_category ON "Plant"("category");
CREATE INDEX idx_order_userId ON "Order"("userId");
CREATE INDEX idx_order_status ON "Order"("status");
CREATE INDEX idx_search_userId ON "Search"("userId");
`;

// Function to run the setup
async function setupDatabase() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected to database.');
    
    console.log('Creating tables...');
    await client.query(createTableSQL);
    console.log('Tables created successfully!');
    
    // Add sample data (optional)
    console.log('Adding sample data...');
    
    // Sample user
    const userResult = await client.query(`
      INSERT INTO "User" ("email", "name", "password", "role")
      VALUES ('admin@example.com', 'Admin User', '$2a$10$zPiXQ2Ln.Ah5QLBZNrp6qOYK2fCOwcEGe/VQWlTOQKNQnRbW0lRYC', 'ADMIN')
      RETURNING id;
    `);
    
    const userId = userResult.rows[0].id;
    console.log(`Created sample user with ID: ${userId}`);
    
    // Sample plants
    const plants = [
      ['Monstera Deliciosa', 'मोंस्टेरा', 'મોન્સ્ટેરા', 'Monstera deliciosa', 1200, '/images/plants/monstera.jpg', '/images/plants/fallback.jpg', 'Indoor', 'Easy', 'Medium', 'Weekly', true],
      ['Snake Plant', 'सांप पौधा', 'સાપ છોડ', 'Sansevieria trifasciata', 800, '/images/plants/snake-plant.jpg', '/images/plants/fallback.jpg', 'Indoor', 'Easy', 'Low', 'Bi-weekly', true],
      ['Peace Lily', 'शांति लिली', 'પીસ લિલી', 'Spathiphyllum', 950, '/images/plants/peace-lily.jpg', '/images/plants/fallback.jpg', 'Indoor', 'Moderate', 'Medium', 'Weekly', false]
    ];
    
    for (const plant of plants) {
      await client.query(`
        INSERT INTO "Plant" ("name", "nameHi", "nameGu", "scientificName", "price", "image", "fallbackImage", "category", "difficulty", "light", "water", "petFriendly")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12);
      `, plant);
    }
    
    console.log(`Added ${plants.length} sample plants`);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

// Run the setup
setupDatabase(); 