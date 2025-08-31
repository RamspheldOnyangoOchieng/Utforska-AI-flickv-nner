import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
    await cookies();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ success: false, error: "Missing userId" }, { status: 400 });
    }

    // Try token-based authentication first
    const authHeader = request.headers.get('authorization')
    const userIdHeader = request.headers.get('x-user-id')

    let authenticatedUserId: string | null = null

    // Method 1: Try Authorization header (JWT token)
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.replace('Bearer ', '')
        const supabase = createClient()

        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser(token)

            if (!authError && user) {
                authenticatedUserId = user.id
                console.log("✅ User authenticated via token for premium status")
            }
        } catch (error) {
            console.error("❌ Token authentication failed for premium status:", error)
        }
    }

    // Method 2: Fallback to User ID header
    if (!authenticatedUserId && userIdHeader) {
        const supabase = createClient()

        try {
            const { data: userData, error: userError } = await supabase
                .from('users_view')
                .select('id')
                .eq('id', userIdHeader)
                .single()

            if (!userError && userData) {
                authenticatedUserId = userIdHeader
                console.log("✅ User authenticated via user ID for premium status")
            }
        } catch (error) {
            console.error("❌ User ID validation failed for premium status:", error)
        }
    }

    // Verify the requested userId matches the authenticated user (for security)
    if (!authenticatedUserId || authenticatedUserId !== userId) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // Create supabase client for database operations
    const supabase = createClient()

    try {
        console.log(`🔍 Checking premium status for user: ${userId}`);

        let isPremium = false;
        let expiresAt = null;
        let planName = null;

        // Method 1: Check premium_profiles table (most likely location)
        try {
            const { data: premiumProfile, error: profileError } = await supabase
                .from("premium_profiles")
                .select(`
                    expires_at,
                    created_at,
                    plan_id,
                    subscription_plans (
                        name,
                        duration,
                        original_price
                    )
                `)
                .eq("user_id", userId)
                .maybeSingle();

            if (!profileError && premiumProfile) {
                console.log("✅ Found premium profile:", premiumProfile);
                expiresAt = premiumProfile.expires_at;

                // Handle subscription_plans as either object or array
                const planData = Array.isArray(premiumProfile.subscription_plans)
                    ? premiumProfile.subscription_plans
                    : premiumProfile.subscription_plans;
                planName = planData?.name;

                if (expiresAt) {
                    isPremium = new Date(expiresAt) > new Date();
                    console.log(`📅 Premium expires: ${expiresAt}, isPremium: ${isPremium}`);
                }
            } else {
                console.log("❌ No premium profile found:", profileError?.message);
            }
        } catch (profileError) {
            console.log("❌ premium_profiles query failed:", profileError);
        }

        // Method 2: Check payment_transactions for recent successful payments (PRIMARY METHOD)
        if (!isPremium) {
            console.log("🔄 Checking payment_transactions for recent payments...");
            try {
                // First try with subscription_plans join
                let recentPayments: any = null;
                let paymentError: any = null;

                const joinResult = await supabase
                    .from("payment_transactions")
                    .select(`
                        created_at,
                        status,
                        plan_name,
                        plan_id,
                        metadata,
                        subscription_plans (
                            name,
                            duration,
                            original_price
                        )
                    `)
                    .eq("user_id", userId)
                    .eq("status", "completed")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                recentPayments = joinResult.data;
                paymentError = joinResult.error;

                // If join failed, try without join
                if (paymentError) {
                    console.log("🔄 Retrying payment_transactions without join...");
                    const simpleResult = await supabase
                        .from("payment_transactions")
                        .select("created_at, status, plan_name, plan_id, metadata")
                        .eq("user_id", userId)
                        .eq("status", "completed")
                        .order("created_at", { ascending: false })
                        .limit(1)
                        .maybeSingle();

                    recentPayments = simpleResult.data;
                    paymentError = simpleResult.error;
                }

                if (!paymentError && recentPayments) {
                    console.log("✅ Found recent payment:", recentPayments);

                    // Calculate expiry based on subscription plan duration
                    const createdAt = new Date(recentPayments.created_at);

                    // Try to get duration from metadata or subscription_plans
                    let duration = 1; // Default 1 month

                    if (recentPayments.metadata && recentPayments.metadata.planDuration) {
                        duration = parseInt(recentPayments.metadata.planDuration, 10) || 1;
                    } else if (recentPayments.subscription_plans) {
                        const planData = Array.isArray(recentPayments.subscription_plans)
                            ? recentPayments.subscription_plans
                            : recentPayments.subscription_plans;
                        duration = planData?.duration || 1;
                    }

                    const calculatedExpiry = new Date(createdAt);
                    calculatedExpiry.setMonth(calculatedExpiry.getMonth() + duration);

                    expiresAt = calculatedExpiry.toISOString();
                    planName = recentPayments.plan_name ||
                        (recentPayments.metadata && recentPayments.metadata.planName) ||
                        (recentPayments.subscription_plans &&
                            (Array.isArray(recentPayments.subscription_plans)
                                ? recentPayments.subscription_plans?.name
                                : recentPayments.subscription_plans?.name));

                    isPremium = calculatedExpiry > new Date();

                    console.log(`📅 Calculated expiry from payment: ${expiresAt}, isPremium: ${isPremium}, duration: ${duration} months`);
                } else {
                    console.log("❌ No recent payments found:", paymentError?.message);
                }
            } catch (paymentError) {
                console.log("❌ payment_transactions query failed:", paymentError);
            }
        }

        // Method 2.5: Check user_premium_status table (fallback table we create)
        if (!isPremium) {
            console.log("🔄 Checking user_premium_status fallback table...");
            try {
                const { data: premiumStatus, error: statusError } = await supabase
                    .from("user_premium_status")
                    .select("is_premium, expires_at, plan_name, created_at")
                    .eq("user_id", userId)
                    .maybeSingle();

                if (!statusError && premiumStatus && premiumStatus.is_premium) {
                    console.log("✅ Found premium status in fallback table:", premiumStatus);
                    expiresAt = premiumStatus.expires_at;
                    planName = premiumStatus.plan_name;

                    if (expiresAt) {
                        isPremium = new Date(expiresAt) > new Date();
                    } else {
                        isPremium = true; // No expiry means permanent
                    }
                }
            } catch (statusError) {
                console.log("❌ user_premium_status query failed (table may not exist)");
            }
        }

        // Method 3: Check for any premium_users table (legacy)
        if (!isPremium) {
            console.log("🔄 Checking legacy premium_users table...");
            try {
                const { data: legacyPremium, error: legacyError } = await supabase
                    .from("premium_users")
                    .select("expires_at, created_at")
                    .eq("user_id", userId)
                    .maybeSingle();

                if (!legacyError && legacyPremium) {
                    console.log("✅ Found legacy premium record:", legacyPremium);
                    expiresAt = legacyPremium.expires_at;
                    if (expiresAt) {
                        isPremium = new Date(expiresAt) > new Date();
                    }
                }
            } catch (legacyError) {
                console.log("❌ Legacy premium_users query failed (table may not exist)");
            }
        }

        console.log(`🎯 Final premium status for ${userId}: isPremium=${isPremium}, expiresAt=${expiresAt}, plan=${planName}`);

        return NextResponse.json({
            success: true,
            isPremium,
            expiresAt,
            planName,
        });

    } catch (generalError) {
        console.error("❌ General error fetching premium status:", generalError);

        // Return a safe default response instead of failing
        return NextResponse.json({
            success: true,
            isPremium: false,
            expiresAt: null,
            error: "Failed to check premium status"
        });
    }
}
