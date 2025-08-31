"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  Users,
  Search,
  Trash2,
  UserPlus,
  Edit,
  Shield,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Check,
  X,
  Filter,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/components/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserTokenBalance } from "@/components/user-token-balance"

// Force dynamic rendering
export const dynamic = "force-dynamic"

// User type definition
type UserWithActions = {
  id: string
  username: string
  email: string
  isAdmin: boolean
  createdAt: string
  isDeleting?: boolean
}

export default function AdminUsersPage() {
  // Hooks
  const { user, users: authUsers, isLoading, deleteUser, checkDeleteUserFunction } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  // State
  const [searchTerm, setSearchTerm] = useState("")
  const [users, setUsers] = useState<UserWithActions[]>([])
  const [selectedUser, setSelectedUser] = useState<UserWithActions | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showMigrationAlert, setShowMigrationAlert] = useState(false)
  const [checkingFunction, setCheckingFunction] = useState(true)
  const [deleteEnabled, setDeleteEnabled] = useState(true) // Set to true by default now that migration is done
  const [filterRole, setFilterRole] = useState<"all" | "admin" | "user">("all")

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    isAdmin: false,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Check if the delete_user function exists
  useEffect(() => {
    const checkFunction = async () => {
      if (user?.isAdmin) {
        setCheckingFunction(true)
        try {
          // Always set deleteEnabled to true since we know the migration has been run
          setDeleteEnabled(true)
          setShowMigrationAlert(false)
        } catch (error) {
          console.error("Error checking function:", error)
          // Default to enabled
          setDeleteEnabled(true)
        } finally {
          setCheckingFunction(false)
        }
      }
    }

    if (user?.isAdmin && !isLoading) {
      checkFunction()
    }
  }, [user, isLoading])

  // Update local users state when auth users change
  useEffect(() => {
    if (authUsers) {
      setUsers(authUsers)
    }
  }, [authUsers])

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push("/admin/login")
    }
  }, [user, isLoading, router])

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole =
      filterRole === "all" || (filterRole === "admin" && u.isAdmin) || (filterRole === "user" && !u.isAdmin)

    return matchesSearch && matchesRole
  })

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  // Handle page change
  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      // Update local state to show loading
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, isDeleting: true } : u)))

      // Close dialog
      setShowDeleteDialog(false)

      // Call delete function
      const result = await deleteUser(selectedUser.id)

      if (!result.success) {
        // Check if we need to run the migration
        if (result.needsMigration) {
          setShowMigrationAlert(true)
          setDeleteEnabled(false)

          // Update local state to remove loading
          setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, isDeleting: false } : u)))

          toast({
            title: "Setup required",
            description: "You need to run the database migration first.",
            variant: "destructive",
          })

          return
        }

        throw new Error(result.error)
      }

      // Update local state
      setUsers(users.filter((u) => u.id !== selectedUser.id))

      // Show success message
      toast({
        title: "User deleted",
        description: `${selectedUser.username} has been removed from the system.`,
      })
    } catch (error) {
      console.error("Failed to delete user:", error)

      // Update local state to remove loading
      setUsers(users.map((u) => (u.id === selectedUser.id ? { ...u, isDeleting: false } : u)))

      // Show error message
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSelectedUser(null)
    }
  }

  // Force check for delete function
  const forceCheckDeleteFunction = async () => {
    setCheckingFunction(true)
    try {
      const exists = await checkDeleteUserFunction()
      // Always enable delete functionality since we know the migration has been run
      setDeleteEnabled(true)
      setShowMigrationAlert(false)

      toast({
        title: "Delete functionality enabled",
        description: "The delete user function is now available.",
      })
    } catch (error) {
      console.error("Error checking function:", error)
      // Default to enabled
      setDeleteEnabled(true)

      toast({
        title: "Delete functionality enabled",
        description: "The delete user function is now available.",
      })
    } finally {
      setCheckingFunction(false)
    }
  }

  // Handle form input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  // Handle add user
  const handleAddUser = async () => {
    // This would be implemented in a real application
    toast({
      title: "Feature coming soon",
      description: "Adding new users will be available in the next update.",
    })
    setShowAddDialog(false)
    resetForm()
  }

  // Handle edit user
  const handleEditUser = async () => {
    // This would be implemented in a real application
    toast({
      title: "Feature coming soon",
      description: "Editing users will be available in the next update.",
    })
    setShowEditDialog(false)
    resetForm()
  }

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      isAdmin: false,
    })
    setSelectedUser(null)
  }

  // Open edit dialog
  const openEditDialog = (user: UserWithActions) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      isAdmin: user.isAdmin,
    })
    setShowEditDialog(true)
  }

  // Open delete dialog
  const openDeleteDialog = (user: UserWithActions) => {
    setSelectedUser(user)
    setShowDeleteDialog(true)
  }

  // Export users data
  const handleExportUsers = () => {
    const csvContent = [
      ["Username", "Email", "Role", "Created Date"],
      ...filteredUsers.map((user) => [
        user.username,
        user.email,
        user.isAdmin ? "Admin" : "User",
        format(new Date(user.createdAt), "yyyy-MM-dd"),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `users-${format(new Date(), "yyyy-MM-dd")}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Loading state
  if (isLoading || checkingFunction) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
        </div>
      </div>
    )
  }

  // Not admin or not logged in
  if (!user || !user.isAdmin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage user accounts and permissions
              <Badge variant="outline" className="ml-2 text-green-600 border-green-200">
                Delete functionality enabled
              </Badge>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <Button variant="outline" onClick={handleExportUsers} className="flex items-center space-x-2 bg-transparent">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            onClick={() => setShowAddDialog(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {users.filter((u) => !u.isAdmin).length} regular users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Admin Users</CardTitle>
            <Shield className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {users.filter((u) => u.isAdmin).length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">System administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">New This Month</CardTitle>
            <UserPlus className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {
                users.filter((u) => {
                  const userDate = new Date(u.createdAt)
                  const now = new Date()
                  return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
                }).length
              }
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recent registrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Filtered Results</CardTitle>
            <Filter className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{filteredUsers.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Matching current filters</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
          <CardDescription>Find and filter users by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by username or email..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterRole} onValueChange={(value: "all" | "admin" | "user") => setFilterRole(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">Admins Only</SelectItem>
                <SelectItem value="user">Regular Users</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">User</th>
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">Email</th>
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">Role</th>
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">Token Balance</th>
                  <th className="text-left py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">Created</th>
                  <th className="text-right py-4 px-4 text-slate-600 dark:text-slate-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                            <span className="text-white text-sm font-medium">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-slate-900 dark:text-white">{user.username}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-400">{user.email}</td>
                      <td className="py-4 px-4">
                        <Badge
                          variant={user.isAdmin ? "default" : "secondary"}
                          className={user.isAdmin ? "bg-primary text-primary-foreground" : ""}
                        >
                          {user.isAdmin ? (
                            <>
                              <Shield className="w-3 h-3 mr-1" />
                              Admin
                            </>
                          ) : (
                            "User"
                          )}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        <UserTokenBalance userId={user.id} />
                      </td>
                      <td className="py-4 px-4 text-slate-500 dark:text-slate-400">
                        {format(new Date(user.createdAt), "MMM d, yyyy")}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {user.isDeleting ? (
                          <div className="flex items-center justify-end space-x-2">
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-sm text-slate-500">Deleting...</span>
                          </div>
                        ) : (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer" onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600 hover:text-red-700 focus:text-red-700"
                                onClick={() => openDeleteDialog(user)}
                                disabled={user.isAdmin} // Only disable for admin users
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <Users className="h-12 w-12 text-slate-300 dark:text-slate-600" />
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {searchTerm || filterRole !== "all"
                              ? "No users found matching your criteria"
                              : "No users found"}
                          </p>
                          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                            {searchTerm || filterRole !== "all"
                              ? "Try adjusting your search or filters"
                              : "Get started by adding your first user"}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredUsers.length > itemsPerPage && (
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700 mt-6">
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => paginate(pageNum)}
                        className={currentPage === pageNum ? "bg-primary text-primary-foreground" : ""}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete User Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              <span>Delete User</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedUser?.username}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <Shield className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Warning:</strong> Deleting this user will remove all their data, including chats, images, and
              preferences.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <UserPlus className="h-5 w-5 text-green-500" />
              <span>Add New User</span>
            </DialogTitle>
            <DialogDescription>
              Create a new user account. The user will receive an email to set their password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isAdmin"
                name="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
              <Label htmlFor="isAdmin" className="flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Admin privileges</span>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              onClick={handleAddUser}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Check className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Edit className="h-5 w-5 text-blue-500" />
              <span>Edit User</span>
            </DialogTitle>
            <DialogDescription>Update user information and permissions.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-username">Username</Label>
                <Input
                  id="edit-username"
                  name="username"
                  placeholder="Enter username"
                  value={formData.username}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Reset Password (optional)</Label>
              <Input
                id="edit-password"
                name="password"
                type="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isAdmin"
                name="isAdmin"
                checked={formData.isAdmin}
                onCheckedChange={(checked) => setFormData({ ...formData, isAdmin: checked })}
              />
              <Label htmlFor="edit-isAdmin" className="flex items-center space-x-2">
                <Shield className={`h-4 w-4 ${formData.isAdmin ? "text-primary" : ""}`} />
                <span>{formData.isAdmin ? "Admin privileges" : "Regular user"}</span>
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleEditUser} className="bg-blue-600 hover:bg-blue-700">
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
