"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, Star, StarOff, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { deleteSubscriptionPlan, togglePopularStatus } from "@/lib/subscription-plans"
import { formatCurrency } from "@/lib/utils"
import type { SubscriptionPlan } from "@/types/subscription"

interface SubscriptionPlansListProps {
  initialPlans: SubscriptionPlan[]
}

export default function SubscriptionPlansList({ initialPlans }: SubscriptionPlansListProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [planToDelete, setPlanToDelete] = useState<SubscriptionPlan | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUpdating, setIsUpdating] = useState<string | null>(null)

  const handleDeleteClick = (plan: SubscriptionPlan) => {
    setPlanToDelete(plan)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return

    setIsDeleting(true)
    try {
      await deleteSubscriptionPlan(planToDelete.id)
      setPlans(plans.filter((plan) => plan.id !== planToDelete.id))
    } catch (error) {
      console.error("Failed to delete subscription plan:", error)
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setPlanToDelete(null)
    }
  }

  const handleTogglePopular = async (plan: SubscriptionPlan) => {
    setIsUpdating(plan.id)
    try {
      const updatedPlan = await togglePopularStatus(plan.id, !plan.is_popular)
      setPlans(plans.map((p) => (p.id === plan.id ? updatedPlan : p)))
    } catch (error) {
      console.error("Failed to update popular status:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  const getDurationText = (duration: number) => {
    if (duration === 1) return "Monthly"
    if (duration === 3) return "Quarterly"
    if (duration === 6) return "Bi-annually"
    if (duration === 12) return "Annually"
    return `${duration} months`
  }

  return (
    <div className="rounded-md border border-[#252525]">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#141414] hover:bg-[#141414]">
            <TableHead className="w-[250px]">Plan Name</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Popular</TableHead>
            <TableHead>Features</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No subscription plans found. Create your first plan.
              </TableCell>
            </TableRow>
          ) : (
            plans.map((plan) => (
              <TableRow key={plan.id} className="hover:bg-[#1A1A1A]">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {plan.promotional_image && (
                      <div className="h-8 w-8 rounded overflow-hidden">
                        <Image
                          src={plan.promotional_image || "/placeholder.svg"}
                          alt={plan.name}
                          width={32}
                          height={32}
                          className="object-cover"
                        />
                      </div>
                    )}
                    {plan.name}
                  </div>
                </TableCell>
                <TableCell>{getDurationText(plan.duration)}</TableCell>
                <TableCell>
                  {plan.discounted_price ? (
                    <div>
                      <span className="line-through text-muted-foreground mr-2">
                        {formatCurrency(plan.original_price)}
                      </span>
                      <span className="font-medium text-green-500">{formatCurrency(plan.discounted_price)}</span>
                    </div>
                  ) : (
                    formatCurrency(plan.original_price)
                  )}
                </TableCell>
                <TableCell>
                  {plan.discount_percentage ? (
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                      {plan.discount_percentage}% off
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePopular(plan)}
                    disabled={isUpdating === plan.id}
                    className={plan.is_popular ? "text-yellow-500" : "text-muted-foreground"}
                  >
                    {plan.is_popular ? <Star className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                  </Button>
                </TableCell>
                <TableCell>
                  {plan.features.length > 0 ? (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      {plan.features.length} features
                    </Badge>
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/dashboard/subscriptions/preview/${plan.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admin/dashboard/subscriptions/edit/${plan.id}`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(plan)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#141414] border border-[#252525]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the subscription plan "{planToDelete?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
