import TransactionDetails from "~/components/transaction-details";
import { api } from "~/trpc/server";

export default async function Page({
    params,
  }: {
    params: Promise<{ id: string }>;
  }) {

    const { id } = await params;
  const transaction = await api.transactions.getById({
    id: Number(id),
  });

    if (!transaction) return <div>Transaction not found</div>;
    return (
        <TransactionDetails transaction={transaction} />
    );
    }