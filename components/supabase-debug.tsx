"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export function SupabaseDebug() {
  const [tables, setTables] = useState<string[]>([])
  const [policies, setPolicies] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  const fetchDatabaseInfo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClientComponentClient()

      // Test a simple insert to a public table
      const testData = {
        test_value: "Debug test " + new Date().toISOString(),
      }

      // Try to create a test table using RPC
      try {
        await supabase.rpc("create_debug_table")
      } catch (err) {
        console.log("Note: create_debug_table function may not exist yet:", err)
      }

      // Try to insert into the test table
      try {
        const { data: insertResult, error: insertError } = await supabase.from("debug_test").insert(testData).select()

        if (insertError) {
          setTestResult({ error: insertError })
        } else {
          setTestResult({ success: true, data: insertResult })
        }
      } catch (err) {
        setTestResult({ error: `Error with test insert: ${err}` })
      }

      // Get list of tables using a direct query
      try {
        const { data: tablesData, error: tablesError } = await supabase.rpc("get_public_tables")

        if (tablesError) {
          // Try alternative method
          const { data, error } = await supabase.from("chat_messages").select("id").limit(1)
          if (error) {
            setError("Error checking chat_messages: " + error.message)
          } else {
            setTables(["chat_messages (verified)"])
          }
        } else {
          setTables(tablesData || [])
        }
      } catch (err) {
        setError("Error fetching tables: " + String(err))

        // Try alternative method
        try {
          const { data, error } = await supabase.from("chat_messages").select("id").limit(1)
          if (!error) {
            setTables(["chat_messages (verified)"])
          }
        } catch (e) {
          console.error("Alternative method also failed:", e)
        }
      }

      // Test direct chat_messages insert
      try {
        const testMessage = {
          id: `test-${Date.now()}`,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          character_id: "test",
          content: "Test message",
          role: "user",
        }

        const { error: msgError } = await supabase.from("chat_messages").insert(testMessage)

        if (msgError) {
          setError((prev) => (prev || "") + "\nChat insert error: " + msgError.message)
        } else {
          setError((prev) => (prev || "") + "\nChat insert success!")
        }
      } catch (err) {
        setError((prev) => (prev || "") + "\nChat insert exception: " + String(err))
      }
    } catch (err) {
      setError("Error: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Debug button removed as requested */}

      {isOpen && (
        <div className="mt-2 p-4 bg-black/90 border border-blue-800 rounded-md text-blue-300 text-xs font-mono w-80 max-h-96 overflow-auto">
          <h3 className="text-sm font-bold mb-2">Supabase Debug</h3>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchDatabaseInfo}
            disabled={isLoading}
            className="mb-2 text-xs border-blue-800"
          >
            {isLoading ? "Loading..." : "Test Database Connection"}
          </Button>

          {error && (
            <div className="p-2 bg-red-900/20 border border-red-800 text-red-300 rounded mb-2 whitespace-pre-wrap">
              {error}
            </div>
          )}

          {testResult && (
            <div className="mb-2">
              <h4 className="font-bold">Test Insert:</h4>
              <pre className="text-xs overflow-auto max-h-20">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}

          <div className="mb-2">
            <h4 className="font-bold">Tables:</h4>
            {tables.length > 0 ? (
              <ul className="list-disc pl-4">
                {tables.map((table, i) => (
                  <li key={i} className={table.includes("chat_messages") ? "text-green-400" : ""}>
                    {table}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No tables found or not loaded yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
