const AIML_VIDEO_URL = "https://api.aimlapi.com/v2/video/generations";

export type VideoStatus = {
  status: "queued" | "processing" | "completed" | "failed";
  videoUrl: string | null;
};

/**
 * Submit a PixVerse v5 transition job via AIML API.
 * petPhotoUrl is the first frame; portraitUrl is the last frame.
 * The model generates a smooth transition between the two images.
 * Returns the task ID for polling.
 */
export async function generateTransformationVideo(
  petPhotoUrl: string,
  portraitUrl: string,
  theme: string,
  aimlApiKey: string,
): Promise<string> {
  const prompt = `smooth magical transformation, theme: ${theme}, sparkle effect`;
  const requestBody = {
    model: "pixverse/v5/transition",
    image_url: petPhotoUrl,
    tail_image_url: portraitUrl,
    prompt,
    duration: 5,
    resolution: "720p",
  };

  console.log("[video] image_url being sent:", petPhotoUrl);
  console.log("[video] tail_image_url being sent:", portraitUrl);
  console.log("[video] full request body:", JSON.stringify(requestBody));

  const res = await fetch(AIML_VIDEO_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${aimlApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await res.text();
  console.log("[video] AIML response status:", res.status);
  console.log("[video] AIML response body:", responseText);

  if (!res.ok) {
    let err: any = {};
    try { err = JSON.parse(responseText); } catch {}
    throw new Error(`AIML API error: ${err?.error?.message ?? res.statusText}`);
  }

  const data: any = JSON.parse(responseText);
  const taskId: string | undefined = data?.id ?? data?.generation_id;
  if (!taskId) throw new Error("AIML API returned no task ID.");
  return taskId;
}

/** Poll PixVerse v5 generation status via AIML API. */
export async function checkVideoStatus(
  taskId: string,
  aimlApiKey: string,
): Promise<VideoStatus> {
  const res = await fetch(
    `${AIML_VIDEO_URL}?generation_id=${encodeURIComponent(taskId)}`,
    { headers: { Authorization: `Bearer ${aimlApiKey}` } },
  );

  if (!res.ok) return { status: "failed", videoUrl: null };

  const data: any = await res.json();
  const rawStatus: string = data?.status ?? "generating";
  const videoUrl: string | null = data?.video?.url ?? null;

  if (rawStatus === "completed" && videoUrl) return { status: "completed", videoUrl };
  if (rawStatus === "error") return { status: "failed", videoUrl: null };
  if (rawStatus === "queued") return { status: "queued", videoUrl: null };
  return { status: "processing", videoUrl: null }; // "generating" maps here
}
