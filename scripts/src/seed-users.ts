import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function main() {
  const hash = await bcrypt.hash("password123", 12);
  
  await db.update(usersTable)
    .set({ passwordHash: hash })
    .where(eq(usersTable.email, "demo@ecmarketsindia.com"));
    
  await db.update(usersTable)
    .set({ passwordHash: hash })
    .where(eq(usersTable.email, "admin@ecmarketsindia.com"));
    
  console.log("Passwords updated successfully to 'password123'");
  process.exit(0);
}

main().catch(console.error);
