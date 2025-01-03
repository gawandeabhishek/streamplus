import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  req: Request,
  { params }: { params: { friendId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { status } = await req.json();

    const updatedRequest = await db.friend.update({
      where: {
        id: params.friendId,
      },
      data: { 
        status: status === 'accept' ? 'accepted' : 'rejected'
      },
      include: {
        user: true,
        friend: true,
      }
    });

    await supabase.channel(`friends:${updatedRequest.userId}`).send({
      type: 'broadcast',
      event: 'friend_request_update',
      payload: {
        requestId: params.friendId,
        status: status === 'accept' ? 'accepted' : 'rejected',
        userId: updatedRequest.userId,
        friendId: updatedRequest.friendId
      }
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating friend request:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// export async function DELETE(
//     req: Request,
//     { params }: { params: { requestId: string } }
//   ) {
//     try {
//       const session = await getServerSession(authOptions);
//       if (!session?.user?.id) {
//         return new NextResponse("Unauthorized", { status: 401 });
//       }
  
//       // First get the friend relationship to get both user IDs
//       const friendRelation = await db.friend.findFirst({
//         where: {
//           OR: [
//             { 
//               userId: session.user.id,
//               friendId: params.requestId,
//             },
//             {
//               userId: params.requestId,
//               friendId: session.user.id,
//             }
//           ]
//         },
//       });
  
//       if (!friendRelation) {
//         return new NextResponse("Friend relationship not found", { status: 404 });
//       }
  
//       // Delete the relationship
//       await db.friend.deleteMany({
//         where: {
//           OR: [
//             { 
//               userId: session.user.id,
//               friendId: params.requestId,
//             },
//             {
//               userId: params.requestId,
//               friendId: session.user.id,
//             }
//           ]
//         },
//       });
  
//       // Broadcast to both users
//       await supabase.channel(`friends:${session.user.id}`).send({
//         type: 'broadcast',
//         event: 'friend_removed',
//         payload: { 
//           userId: session.user.id,
//           friendId: params.requestId 
//         }
//       });
  
//       await supabase.channel(`friends:${params.requestId}`).send({
//         type: 'broadcast',
//         event: 'friend_removed',
//         payload: { 
//           userId: params.requestId,
//           friendId: session.user.id 
//         }
//       });
  
//       return new NextResponse(null, { status: 200 });
//     } catch (error) {
//       console.error("Error removing friend:", error);
//       return new NextResponse("Internal Error", { status: 500 });
//     }
//   }