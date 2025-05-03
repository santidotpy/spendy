
import TransactionsList from "~/components/transactions-list"
import { api } from "~/trpc/server"

export default async function Page() {
    const data = await api.transactions.getAll()
  return (
    <main className="container mx-auto p-4">
      <TransactionsList transactions={data} />
    </main>
  )
}