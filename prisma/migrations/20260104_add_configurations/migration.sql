/*
  Warnings:

  - You are about to create a table `configurations`. If the table is not empty, all the data it contains will be lost.

*/

-- CreateTable
CREATE TABLE "configurations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "loja_nome" TEXT,
    "loja_endereco" TEXT,
    "loja_telefone" TEXT,
    "loja_email" TEXT,
    "loja_cnpj" TEXT,
    "notif_estoque_min" BOOLEAN NOT NULL DEFAULT true,
    "notif_novos_pedidos" BOOLEAN NOT NULL DEFAULT true,
    "notif_email_vendas" BOOLEAN NOT NULL DEFAULT false,
    "tema" TEXT NOT NULL DEFAULT 'claro',
    "moeda" TEXT NOT NULL DEFAULT 'BRL',
    "fuso" TEXT NOT NULL DEFAULT 'America/Sao_Paulo',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configurations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configurations_user_id_key" ON "configurations"("user_id");

-- AddForeignKey
ALTER TABLE "configurations" ADD CONSTRAINT "configurations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;