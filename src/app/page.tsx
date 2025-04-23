import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, Lock, Tag, Upload } from "lucide-react"


export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col">
      
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b sticky top-0 z-10 w-full border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <Link href="#" className="flex items-center">
          <span className="font-bold text-xl">Spendy</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
            Features
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Pricing
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            Blog
          </Link>
          <Link href="#" className="text-sm font-medium hover:underline underline-offset-4">
            FAQ
          </Link>
        </nav>
        <div className="flex gap-4">
          <Link
            href="/sign-in"
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-200 px-4 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex h-9 items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-gray-50 shadow-sm transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
          >
            Sign Up
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Track Your Expenses Effortlessly
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">
                    Upload your card summaries and see where your money goes
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/dashboard/upload"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Upload Statement
                    <Upload className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="#"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
                  >
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=400&width=500"
                  width={500}
                  height={400}
                  alt="Finance Dashboard"
                  className="rounded-lg object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Features</h2>
                <p className="max-w-[700px] text-gray-500 md:text-xl">
                  Our app makes personal finance management simple and insightful
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white p-6 shadow-sm">
                <div className="rounded-full bg-gray-100 p-3">
                  <Tag className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Auto-categorize Expenses</h3>
                <p className="text-center text-gray-500">
                  Our AI automatically categorizes your expenses so you can see where your money goes
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white p-6 shadow-sm">
                <div className="rounded-full bg-gray-100 p-3">
                  <BarChart3 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Simple Dashboards</h3>
                <p className="text-center text-gray-500">
                  Intuitive dashboards that give you a clear picture of your spending habits
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border bg-white p-6 shadow-sm">
                <div className="rounded-full bg-gray-100 p-3">
                  <Lock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Secure & Private</h3>
                <p className="text-center text-gray-500">
                  Your financial data is encrypted and never shared with third parties
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center gap-6 px-4 md:px-6 lg:grid-cols-2 lg:gap-10 mx-auto">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to take control of your finances?
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl">
                Join thousands of users who have simplified their financial management
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row lg:justify-end">
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
              >
                Get Started
              </Link>
              <Link
                href="#"
                className="inline-flex h-10 items-center justify-center rounded-md border border-gray-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t mx-auto">
        <p className="text-xs text-gray-500">© 2024 Spendy. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}