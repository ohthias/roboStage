import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateUUID, ValidationError } from "@/utils/validation";
import { ApiError, ErrorCode } from "@/utils/errorHandling";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Validates request and extracts user ID
 */
function validateRequest(body: unknown): string {
  if (!body || typeof body !== "object") {
    throw new ApiError("Invalid request body", 400, ErrorCode.VALIDATION_ERROR);
  }

  const bodyObj = body as Record<string, unknown>;
  const userId = bodyObj.userId;

  if (!userId) {
    throw new ApiError("userId is required", 400, ErrorCode.VALIDATION_ERROR);
  }

  try {
    return validateUUID(userId, "userId");
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new ApiError(error.message, 400, ErrorCode.VALIDATION_ERROR);
    }
    throw error;
  }
}

/**
 * Deletes all user data in a single transaction-like operation
 * Note: Supabase doesn't have explicit transaction support, but we use a coordinated
 * sequence with careful error handling and rollback consideration
 */
export async function POST(req: NextRequest) {
  let userId: string;

  try {
    const body = await req.json();
    userId = validateRequest(body);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode },
      );
    }
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }

  try {
    // Delete in the order of foreign key dependencies (child tables first)
    const deletionSequence = [
      { table: "user_tags", description: "tags" },
      { table: "user_followers", description: "followers" },
      { table: "team_members", description: "team memberships" },
      { table: "documents", description: "documents" },
      { table: "tests", description: "tests" },
      { table: "folders", description: "folders" },
      { table: "styleLab", description: "styles" },
    ];

    // Execute deletions in sequence
    for (const { table, description } of deletionSequence) {
      let deleteQuery = supabaseAdmin.from(table).delete();

      // Different tables use different user ID column names
      if (table === "user_followers") {
        deleteQuery = deleteQuery.or(`user_id.eq.${userId},follower_id.eq.${userId}`);
      } else if (table === "team_members") {
        deleteQuery = deleteQuery.eq("user_id", userId);
      } else {
        deleteQuery = deleteQuery.eq("user_id", userId);
      }

      const { error: deleteError } = await deleteQuery;

      if (deleteError) {
        console.error(`Error deleting ${description}:`, deleteError);
        return NextResponse.json(
          {
            error: `Failed to delete ${description}. Please try again later.`,
            code: ErrorCode.DATABASE_ERROR,
          },
          { status: 500 },
        );
      }
    }

    /* ================= DELETE STORAGE FILES ================= */

    try {
      const { data: files, error: listError } = await supabaseAdmin.storage
        .from("photos")
        .list(`avatars/${userId}`);

      if (listError) {
        console.error("Error listing files:", listError);
        // Continue with deletion - storage files are less critical
      } else if (files && files.length > 0) {
        const paths = files.map((file) => `avatars/${userId}/${file.name}`);
        const { error: removeError } = await supabaseAdmin.storage
          .from("photos")
          .remove(paths);

        if (removeError) {
          console.error("Error removing storage files:", removeError);
          // Continue - storage deletion failure shouldn't block account deletion
        }
      }
    } catch (storageError) {
      console.error("Storage operation error:", storageError);
      // Continue with profile deletion
    }

    /* ================= DELETE PROFILE ================= */

    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileError) {
      console.error("Error deleting profile:", profileError);
      return NextResponse.json(
        {
          error: "Failed to delete profile. Please try again later.",
          code: ErrorCode.DATABASE_ERROR,
        },
        { status: 500 },
      );
    }

    /* ================= DELETE AUTH USER ================= */

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Error deleting auth user:", authError);
      return NextResponse.json(
        {
          error: "Failed to delete authentication account. Please try again later.",
          code: ErrorCode.DATABASE_ERROR,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Account successfully deleted",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Unexpected error during user deletion:", error);

    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        code: ErrorCode.INTERNAL_ERROR,
      },
      { status: 500 },
    );
  }
}
