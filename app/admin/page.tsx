import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldCheck, Database, Code, TestTube } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Set Up Row Level Security
            </CardTitle>
            <CardDescription>Configure RLS policies to ensure data privacy</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Set up Row Level Security policies to ensure users can only access their own data.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/setup-rls">
              <Button>Set Up RLS</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Set Up Anonymous Access
            </CardTitle>
            <CardDescription>Configure policies for anonymous users</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Set up policies to allow anonymous users to access their own data.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/setup-anonymous-access">
              <Button>Set Up Anonymous Access</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Execute SQL
            </CardTitle>
            <CardDescription>Run SQL statements directly</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Execute custom SQL statements against your Supabase database.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/execute-sql">
              <Button>Execute SQL</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Test RLS Policies
            </CardTitle>
            <CardDescription>Verify your RLS policies are working</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Test if your Row Level Security policies are correctly enforced.</p>
          </CardContent>
          <CardFooter>
            <Link href="/admin/test-rls">
              <Button>Test RLS</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Manual Setup Tools</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Manual RLS Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                Set up Row Level Security policies manually by providing your Supabase credentials directly.
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm">
                <Link href="/admin/manual-setup">Go to Manual Setup</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Database Setup</CardTitle>
            <CardDescription>Set up database tables and RLS policies</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Run SQL scripts to create tables and configure Row Level Security.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/database-setup">Go to Database Setup</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>SQL Editor</CardTitle>
            <CardDescription>Execute SQL queries directly</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Run custom SQL queries against your Supabase database.</p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/sql-editor">Go to SQL Editor</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
