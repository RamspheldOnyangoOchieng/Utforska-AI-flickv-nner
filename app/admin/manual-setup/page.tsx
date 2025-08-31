import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ManualSetupPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Manual Setup Tools</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Manual RLS Setup</CardTitle>
            <CardDescription>Set up Row Level Security policies manually</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This tool allows you to set up Row Level Security policies by providing your Supabase credentials
              directly. Use this if the automatic setup is not working.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/manual-rls-setup">Go to Manual RLS Setup</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual SQL Execution</CardTitle>
            <CardDescription>Execute custom SQL queries</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This tool allows you to execute custom SQL queries by providing your Supabase credentials directly. Use
              this for advanced database operations.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/manual-sql">Go to Manual SQL Execution</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual RLS Testing</CardTitle>
            <CardDescription>Test Row Level Security policies manually</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              This tool allows you to test Row Level Security policies by providing your Supabase credentials directly.
              Use this to verify that your RLS policies are working correctly.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild>
              <Link href="/admin/manual-test-rls">Go to Manual RLS Testing</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">SQL Scripts for Manual Execution</h2>
        <Card>
          <CardHeader>
            <CardTitle>RLS Setup SQL</CardTitle>
            <CardDescription>SQL script to set up Row Level Security policies</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md text-xs overflow-auto whitespace-pre-wrap">
              {`-- Enable RLS on tables
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can only see their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only insert their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only update their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only delete their own images" ON generated_images;
DROP POLICY IF EXISTS "Users can only see their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only insert their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only update their own collections" ON collections;
DROP POLICY IF EXISTS "Users can only delete their own collections" ON collections;

-- Create policies for generated_images
CREATE POLICY "Users can only see their own images"
ON generated_images FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own images"
ON generated_images FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own images"
ON generated_images FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own images"
ON generated_images FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for collections
CREATE POLICY "Users can only see their own collections"
ON collections FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own collections"
ON collections FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own collections"
ON collections FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own collections"
ON collections FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for anonymous access
DROP POLICY IF EXISTS "Anonymous users can access their own images" ON generated_images;
DROP POLICY IF EXISTS "Anonymous users can access their own collections" ON collections;

CREATE POLICY "Anonymous users can access their own images"
ON generated_images FOR ALL
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Anonymous users can access their own collections"
ON collections FOR ALL
USING (auth.uid() IS NOT NULL);`}
            </pre>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              You can copy this SQL script and execute it directly in the Supabase SQL Editor.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
