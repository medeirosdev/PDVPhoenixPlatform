import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seedando banco de dados...");
  
  const { db } = await import("./index.js");
  const { users, produtos } = await import("./schema.js");

  const hash = await bcrypt.hash("123", 12);

  await db
    .insert(users)
    .values({
      name: "Admin",
      email: "admin@vendinha.com",
      passwordHash: hash,
    })
    .onConflictDoNothing();

  await db
    .insert(produtos)
    .values([
      { nome: "KitKat Tradicional", precoVenda: "2.50", precoCusto: "1.20", estoqueAtual: 30, alertaEstoque: 5 },
      { nome: "Bis Chocolate", precoVenda: "2.00", precoCusto: "0.90", estoqueAtual: 20, alertaEstoque: 5 },
      { nome: "Trident Menta", precoVenda: "1.50", precoCusto: "0.70", estoqueAtual: 40, alertaEstoque: 8 },
      { nome: "Ruffles Original", precoVenda: "5.00", precoCusto: "2.80", estoqueAtual: 15, alertaEstoque: 3 },
    ])
    .onConflictDoNothing();

  console.log("Seed concluído!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
