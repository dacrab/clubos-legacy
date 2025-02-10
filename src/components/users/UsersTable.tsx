import { formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Profile } from "@/types"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface UsersTableProps {
  users: Profile[] | null
}

export function UsersTable({ users }: UsersTableProps) {
  if (!users?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No users found</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Name
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Email
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Role
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Created
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                >
                  <td className="p-4 align-middle">{user.name}</td>
                  <td className="p-4 align-middle">{user.email}</td>
                  <td className="p-4 align-middle">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : user.role === "staff"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 align-middle">
                    {formatDate(new Date(user.created_at))}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex gap-2">
                      <Link href={`/dashboard/users/${user.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Edit user"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <form
                        action={`/dashboard/users/${user.id}/delete`}
                        method="POST"
                      >
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 