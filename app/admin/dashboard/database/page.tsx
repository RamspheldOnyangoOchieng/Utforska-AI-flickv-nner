"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-context"
import { useCharacters } from "@/components/character-context"
import { Home, RefreshCw, Check, AlertTriangle, Copy, ExternalLink, Database } from "lucide-react"

export default function AdminDatabasePage() {
  const { user, isLoading } = useAuth()
  const { initDb, error: dbError, storageBucketExists, createAdminUsersTable } = useCharacters()
  const router = useRouter()
  const [isInitializing, setIsInitializing] = useState(false)
  const [initStatus, setInitStatus] = useState<"idle" | "success" | "error" | "warning">("idle")
  const [statusMessage, setStatusMessage] = useState("")
  const [copied, setCopied] = useState(false)
  const [dbInitialized, setDbInitialized] = useState(false)

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  const handleInitializeDatabase = async () => {
    setIsInitializing(true)
    setStatusMessage("Initializing database...")

    try {
      const success = await initDb()

      if (success) {
        if (!storageBucketExists) {
          setInitStatus("warning")
          setStatusMessage(
            "Database table created successfully, but storage bucket setup requires manual steps. See instructions below.",
          )
        } else {
          setInitStatus("success")
          setStatusMessage("Database initialized successfully!")
        }
        setDbInitialized(true)
      } else {
        setInitStatus("error")
        setStatusMessage("Failed to initialize database automatically. Please use the manual setup instructions below.")
        setDbInitialized(false)
      }
    } catch (err) {
      console.error("Error initializing database:", err)
      setInitStatus("error")
      setStatusMessage("An error occurred during initialization.")
      setDbInitialized(false)
    } finally {
      setIsInitializing(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#141414]">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white">
      <div className="flex h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-[#1A1A1A] border-b border-[#252525] p-4 flex justify-between items-center">
            <h2 className="text-xl font-bold">Database Management</h2>
            <Button variant="outline" onClick={() => router.push("/")}>
              <Home className="mr-2 h-4 w-4" />
              View Site
            </Button>
          </header>

          <div className="p-6">
            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Database Status</h3>

              {dbError && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg flex items-start">
                  <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Database Error</p>
                    <p className="text-sm">{dbError}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div
                  className={`p-4 rounded-lg border ${dbInitialized ? "bg-green-900/20 border-green-800 text-green-300" : "bg-red-900/20 border-red-800 text-red-300"}`}
                >
                  <div className="flex items-center mb-2">
                    {dbInitialized ? <Check className="h-5 w-5 mr-2" /> : <AlertTriangle className="h-5 w-5 mr-2" />}
                    <h4 className="font-medium">Database Table</h4>
                  </div>
                  <p className="text-sm">
                    {dbInitialized
                      ? "The characters table is properly set up."
                      : "The characters table doesn't exist. Initialize it using the button below or follow the manual setup instructions."}
                  </p>
                </div>

                <div className="p-4 rounded-lg border bg-blue-900/20 border-blue-800 text-blue-300">
                  <div className="flex items-center mb-2">
                    <Check className="h-5 w-5 mr-2" />
                    <h4 className="font-medium">Image Storage</h4>
                  </div>
                  <p className="text-sm">Using Cloudinary for image storage. No additional setup required.</p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-400 mb-4">
                  If you're seeing errors about missing tables or relations, you can try to initialize the database
                  schema here. This will attempt to create the characters table, but you'll need to manually set up the
                  storage bucket.
                </p>

                {initStatus === "success" && (
                  <div className="mb-4 p-4 bg-green-900/20 border border-green-800 text-green-300 rounded-lg flex items-center">
                    <Check className="h-5 w-5 mr-2" />
                    {statusMessage}
                  </div>
                )}

                {initStatus === "warning" && (
                  <div className="mb-4 p-4 bg-yellow-900/20 border border-yellow-800 text-yellow-300 rounded-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {statusMessage}
                  </div>
                )}

                {initStatus === "error" && (
                  <div className="mb-4 p-4 bg-red-900/20 border border-red-800 text-red-300 rounded-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    {statusMessage}
                  </div>
                )}

                <Button
                  onClick={handleInitializeDatabase}
                  disabled={isInitializing}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isInitializing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Initializing...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Initialize Database Table
                    </>
                  )}
                </Button>
                <Button
                  onClick={async () => {
                    setIsInitializing(true)
                    try {
                      const success = await createAdminUsersTable()
                      if (success) {
                        setInitStatus("success")
                        setStatusMessage("Admin users table created successfully!")
                      } else {
                        setInitStatus("error")
                        setStatusMessage("Failed to create admin users table.")
                      }
                    } catch (error) {
                      console.error("Error creating admin users table:", error)
                      setInitStatus("error")
                      setStatusMessage("An error occurred while creating admin users table.")
                    } finally {
                      setIsInitializing(false)
                    }
                  }}
                  disabled={isInitializing}
                  className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Database className="mr-2 h-4 w-4" />
                  Initialize Admin Users Table
                </Button>
              </div>
            </div>

            <div className="bg-[#1A1A1A] rounded-xl p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Manual Setup Instructions</h3>

              <p className="text-gray-400 mb-4">
                For the most reliable setup, follow these manual steps to configure your database:
              </p>

              <div className="mb-6">
                <h4 className="font-medium mb-2 text-white">Step 1: Create the Database Table</h4>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4 ml-2">
                  <li>
                    <p>
                      Go to the{" "}
                      <a
                        href="https://supabase.com/dashboard"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center"
                      >
                        Supabase Dashboard
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>{" "}
                      and select your project
                    </p>
                  </li>
                  <li>
                    <p>Navigate to the SQL Editor</p>
                  </li>
                  <li>
                    <p>Create a new query and paste the following SQL:</p>
                    <div className="relative mt-2">
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-gray-400 hover:text-white"
                          onClick={copyToClipboard}
                        >
                          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          <span className="ml-1">{copied ? "Copied!" : "Copy"}</span>
                        </Button>
                      </div>
                      <div className="bg-[#252525] p-4 rounded-lg overflow-auto max-h-80">
                        <pre className="text-sm text-gray-300 whitespace-pre-wrap">{sqlScript}</pre>
                      </div>
                    </div>
                  </li>
                  <li>
                    <p>Run the query to create the table and policies</p>
                  </li>
                </ol>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2 text-white">Step 2: Create the Storage Bucket</h4>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4 ml-2">
                  <li>
                    <p>In the Supabase Dashboard, navigate to Storage</p>
                  </li>
                  <li>
                    <p>Click "Create a new bucket"</p>
                  </li>
                  <li>
                    <p>Enter "assets" as the bucket name</p>
                  </li>
                  <li>
                    <p>Check "Public bucket" to make the bucket publicly accessible</p>
                  </li>
                  <li>
                    <p>Click "Create bucket"</p>
                  </li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2 text-white">Step 3: Set Up Storage Policies</h4>
                <ol className="list-decimal list-inside text-gray-300 space-y-2 mb-4 ml-2">
                  <li>
                    <p>In the Storage section, click on the "assets" bucket</p>
                  </li>
                  <li>
                    <p>Go to the "Policies" tab</p>
                  </li>
                  <li>
                    <p>Click "Add policies" and create the following policies:</p>
                    <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-gray-400">
                      <li>Select policy: Allow public access (for everyone)</li>
                      <li>Insert policy: Allow authenticated users only</li>
                    </ul>
                  </li>
                </ol>
              </div>

              <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 text-blue-300 rounded-lg">
                <p className="font-medium mb-1">After completing these steps:</p>
                <p className="text-sm">
                  Refresh the application and navigate back to this page to verify that both the database table and
                  storage bucket are properly set up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// SQL script for manual setup
const sqlScript = `-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 18),
  image TEXT NOT NULL,
  description TEXT NOT NULL,
  personality TEXT,
  occupation TEXT,
  hobbies TEXT,
  body TEXT,
  ethnicity TEXT,
  language TEXT,
  relationship TEXT,
  is_new BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  system_prompt TEXT NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS characters_created_at_idx ON characters (created_at DESC);

-- Enable Row Level Security
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Allow public read access" 
  ON characters FOR SELECT 
  USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access" 
  ON characters FOR ALL 
  USING (auth.role() = 'authenticated');

-- Set up storage for character images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('assets', 'assets', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to assets
CREATE POLICY "Allow public access to assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'assets');

-- Allow authenticated users to upload assets
CREATE POLICY "Allow authenticated users to upload assets"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'assets' AND auth.role() = 'authenticated');`
