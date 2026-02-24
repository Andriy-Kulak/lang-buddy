import { NextResponse } from "next/server";

const ELEVENLABS_TOKEN_URL = "https://api.elevenlabs.io/v1/convai/conversation/token";

export async function POST() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const agentId =
    process.env.ELEVENLABS_AGENT_ID ?? process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;

  if (!apiKey || !agentId) {
    const missing: string[] = [];
    if (!apiKey) {
      missing.push("ELEVENLABS_API_KEY");
    }
    if (!agentId) {
      missing.push("ELEVENLABS_AGENT_ID (or NEXT_PUBLIC_ELEVENLABS_AGENT_ID)");
    }

    return NextResponse.json(
      {
        error: "Missing ElevenLabs environment variables.",
        missing,
      },
      { status: 500 },
    );
  }

  const tokenUrl = new URL(ELEVENLABS_TOKEN_URL);
  tokenUrl.searchParams.set("agent_id", agentId);

  const response = await fetch(tokenUrl, {
    method: "GET",
    headers: {
      "xi-api-key": apiKey,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    return NextResponse.json(
      {
        error: "Failed to create ElevenLabs conversation token.",
        details: details.slice(0, 400),
      },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as { token?: string };

  if (!payload.token) {
    return NextResponse.json(
      { error: "ElevenLabs response did not include a conversation token." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    conversationToken: payload.token,
  });
}
