import { PaymentTransactionsDashboard } from "@/components/payment-transactions-dashboard"

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Payment Transactions</h1>
      <PaymentTransactionsDashboard />
    </div>
  )
}
