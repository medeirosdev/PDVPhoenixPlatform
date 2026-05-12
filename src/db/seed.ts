import { config } from "dotenv";
config({ path: ".env.local" });
import bcrypt from "bcryptjs";

async function seed() {
  console.log("Seedando banco de dados...");
  
  const { db } = await import("./index.js");

  const hash = await bcrypt.hash("123", 12);

  const existingAdmin = await db.user.findUnique({
    where: { email: "admin@vendinha.com" }
  });

  if (!existingAdmin) {
    await db.user.create({
      data: {
        name: "Admin",
        email: "admin@vendinha.com",
        passwordHash: hash,
      }
    });
  }

  const produtosCount = await db.produto.count();

  if (produtosCount === 0) {
    await db.produto.createMany({
      data: [
        { nome: "KitKat Tradicional", precoVenda: 2.50, precoCusto: 1.20, estoqueAtual: 30, alertaEstoque: 5 },
        { nome: "Bis Chocolate", precoVenda: 2.00, precoCusto: 0.90, estoqueAtual: 20, alertaEstoque: 5 },
        { nome: "Trident Menta", precoVenda: 1.50, precoCusto: 0.70, estoqueAtual: 40, alertaEstoque: 8 },
        { nome: "Ruffles Original", precoVenda: 5.00, precoCusto: 2.80, estoqueAtual: 15, alertaEstoque: 3 },
      ]
    });
  }

  console.log("Seed concluído!");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
