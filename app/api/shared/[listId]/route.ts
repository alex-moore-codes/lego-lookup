import { type NextRequest, NextResponse } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function GET(request: NextRequest, { params }: { params: { listId: string } }) {
  try {
    const listId = params.listId

    // In a real app, you'd store shared lists in a database
    // For this example, we'll use a simple approach with Clerk metadata
    const users = await clerkClient.users.getUserList()

    for (const user of users) {
      const sharedLists = (user.publicMetadata.sharedLists as any[]) || []
      const list = sharedLists.find((l) => l.id === listId)
      if (list) {
        return NextResponse.json(list)
      }
    }

    return NextResponse.json({ error: "Shared list not found" }, { status: 404 })
  } catch (error) {
    console.error("Error fetching shared list:", error)
    return NextResponse.json({ error: "Failed to fetch shared list" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { listId: string } }) {
  try {
    const { userId } = auth()
    const listId = params.listId
    const { setNum, purchased } = await request.json()

    // Find the user who owns this shared list
    const users = await clerkClient.users.getUserList()

    for (const user of users) {
      const sharedLists = (user.publicMetadata.sharedLists as any[]) || []
      const listIndex = sharedLists.findIndex((l) => l.id === listId)

      if (listIndex !== -1) {
        const list = sharedLists[listIndex]
        const setIndex = list.sets.findIndex((s) => s.set_num === setNum)

        if (setIndex !== -1) {
          list.sets[setIndex].purchased = purchased
          sharedLists[listIndex] = list

          await clerkClient.users.updateUserMetadata(user.id, {
            publicMetadata: {
              ...user.publicMetadata,
              sharedLists,
            },
          })

          return NextResponse.json({ success: true })
        }
      }
    }

    return NextResponse.json({ error: "Set not found in shared list" }, { status: 404 })
  } catch (error) {
    console.error("Error updating shared list:", error)
    return NextResponse.json({ error: "Failed to update shared list" }, { status: 500 })
  }
}
