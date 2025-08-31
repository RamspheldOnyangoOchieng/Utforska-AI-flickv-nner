

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("Verifying your payment, please wait...");
  const [errorDetail, setErrorDetail] = useState<string>("");

  useEffect(() => {
    if (!sessionId) {
      setStatus("error");
      setMessage("No session ID provided. Unable to verify payment.");
      return;
    }

    fetch(`/api/verify-payment?session_id=${sessionId}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Payment verification failed.");
        }
        return res.json();
      })
      .then((data) => {
        if (data.isPaid) {
          setStatus("success");
          setMessage("Your payment was successful! Your account has been updated.");
          setTimeout(() => router.push("/profile"), 3000);
        } else {
          setStatus("error");
          setMessage("Payment not completed.");
        }
      })
      .catch((err) => {
        setStatus("error");
        setMessage("Payment verification failed.");
        setErrorDetail(err.message || String(err));
      });
  }, [sessionId, router]);

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            Payment {status === "success" ? "Successful" : status === "error" ? "Failed" : "Processing"}
          </CardTitle>
          <CardDescription className="text-center">
            {status === "loading" && "Verifying your payment..."}
            {status === "success" && "You will be redirected to your profile shortly."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "loading" && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
          {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
          {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}

          <p className="mt-4 text-center">{message}</p>
          {status === "error" && errorDetail && (
            <pre className="mt-2 text-xs text-muted-foreground text-left overflow-x-auto max-w-full bg-secondary p-2 rounded">
              {errorDetail}
            </pre>
          )}

          {/* Only show session ID in development */}
          {process.env.NODE_ENV === "development" && sessionId && (
            <p className="mt-2 text-xs text-gray-500">Session ID: {sessionId}</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/profile")}>Go to Profile</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
