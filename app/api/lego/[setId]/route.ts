import { type NextRequest, NextResponse } from "next/server";

const apiKey =
  process.env.REBRICKABLE_API_KEY ||
  process.env.NEXT_PUBLIC_REBRICKABLE_API_KEY;

if (!apiKey) {
  console.error(
    "Missing Rebrickable API key - set REBRICKABLE_API_KEY or NEXT_PUBLIC_REBRICKABLE_API_KEY"
  );
}

export async function GET(
  request: NextRequest,
  { params }: { params: { setId: string } }
) {
  try {
    const { setId } = await params;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Server mis-configuration: Rebrickable API key is not set." },
        { status: 500 }
      );
    }

    // Rebrickable API endpoint
    const response = await fetch(
      `https://rebrickable.com/api/v3/lego/sets/${setId}/`,
      {
        headers: {
          Authorization: `key ${apiKey ?? ""}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "LEGO set not found" },
          { status: 404 }
        );
      }
      throw new Error("Failed to fetch LEGO set");
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching LEGO set:", error);
    return NextResponse.json(
      { error: "Failed to fetch LEGO set" },
      { status: 500 }
    );
  }
}
