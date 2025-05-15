import ClientPage from "./client-page"

// Mock data for a single statement
const getStatement = (id: string) => {
  const statements = {
    "1": {
      id: "1",
      bankName: "Santander",
      accountNumber: "XXXX-XXXX-1234",
      accountType: "Checking",
      dateRange: "Jan 1 - Jan 31, 2025",
      uploadDate: "Feb 5, 2025",
      fileName: "santander_statement_jan_2025.pdf",
      fileSize: "2.4 MB",
      pdfUrl:
        "https://cors-anywhere.herokuapp.com/https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      summary: {
        openingBalance: "$2,450.67",
        closingBalance: "$3,120.89",
        deposits: "$4,200.00",
        withdrawals: "$3,529.78",
      },
    },
    "2": {
      id: "2",
      bankName: "BBVA",
      accountNumber: "XXXX-XXXX-5678",
      accountType: "Savings",
      dateRange: "Jan 1 - Jan 31, 2025",
      uploadDate: "Feb 3, 2025",
      fileName: "bbva_statement_jan_2025.pdf",
      fileSize: "1.8 MB",
      pdfUrl:
        "https://cors-anywhere.herokuapp.com/https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      summary: {
        openingBalance: "$5,320.45",
        closingBalance: "$5,890.12",
        deposits: "$1,200.00",
        withdrawals: "$630.33",
      },
    },
    "3": {
      id: "3",
      bankName: "Galicia",
      accountNumber: "XXXX-XXXX-9012",
      accountType: "Investment",
      dateRange: "Jan 1 - Jan 31, 2025",
      uploadDate: "Feb 2, 2025",
      fileName: "galicia_statement_jan_2025.pdf",
      fileSize: "3.1 MB",
      pdfUrl:
        "https://cors-anywhere.herokuapp.com/https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      summary: {
        openingBalance: "$10,750.20",
        closingBalance: "$11,325.45",
        deposits: "$2,500.00",
        withdrawals: "$1,924.75",
      },
    },
  }

  return statements[id as keyof typeof statements] || null
}

export default function StatementDetailPage({ params }: { params: { id: string } }) {
  const statement = getStatement(params.id)

  if (!statement) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <h3 className="mt-4 text-lg font-medium">Statement not found</h3>
          <p className="text-muted-foreground mt-2">
            The statement you're looking for doesn't exist or has been removed.
          </p>
          <div className="mt-4">
            <a href="/statements" className="text-primary hover:underline">
              Back to Statements
            </a>
          </div>
        </div>
      </div>
    )
  }

  return <ClientPage statement={statement} />
}
