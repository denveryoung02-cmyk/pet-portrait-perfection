# OpenAI Migration Plan — Gemini → OpenAI

**Date**: 2026-06-03  
**Reason**: Cannot obtain valid Google Gemini API key (AI Studio generating `AQ.` format instead of `AIzaSy`)

---

## 🎯 MIGRATION APPROACH

### **Problem**
- Gemini API supports **image-to-image** transformation (send pet photo + prompt → get stylized version)
- OpenAI DALL-E 3 only supports **text-to-image** (send prompt only → get image)
- We NEED the uploaded pet photo to create personalized portraits

### **Solution: Two-Step Process**

**Step 1: GPT-4 Vision** — Analyze uploaded pet photo
- Extract: breed, colors, distinctive features, pose
- Generate enhanced prompt based on actual pet

**Step 2: DALL-E 3** — Generate portrait
- Use enhanced prompt from Step 1
- Apply theme/personality/traits
- Generate stylized portrait

---

## 📋 CODE CHANGES REQUIRED

### **1. Update `src/lib/generations.functions.ts`**

**Current (Gemini)**:
```typescript
// Single API call with image + text
const aiRes = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
  method: "POST",
  body: JSON.stringify({
    contents: [{
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType, data: base64Image } }
      ]
    }]
  })
});
```

**New (OpenAI — Two Steps)**:
```typescript
// Step 1: Analyze pet photo with GPT-4 Vision
const visionRes = await fetch("https://api.openai.com/v1/chat/completions", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "gpt-4o",
    messages: [{
      role: "user",
      content: [
        { 
          type: "text", 
          text: "Analyze this pet photo. Describe: species, breed (if identifiable), coat color/pattern, distinctive features, pose, size. Be concise (2-3 sentences)."
        },
        { 
          type: "image_url", 
          image_url: { url: `data:${mimeType};base64,${base64Image}` }
        }
      ]
    }],
    max_tokens: 300
  })
});

const visionData = await visionRes.json();
const petDescription = visionData.choices[0].message.content;

// Step 2: Generate portrait with DALL-E 3
const enhancedPrompt = `${prompt}\n\nPet details: ${petDescription}`;

const dalleRes = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: enhancedPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    response_format: "b64_json"
  })
});

const dalleData = await dalleRes.json();
const resultBase64 = dalleData.data[0].b64_json;
```

### **2. Update Environment Variable**

**File**: `src/lib/env.server.ts`
```typescript
export type CloudflareEnv = {
  // ... existing vars
  OPENAI_API_KEY?: string;  // Changed from GEMINI_API_KEY
};
```

### **3. Update Documentation**

**Files to Update**:
- `.env.example` — Change to `OPENAI_API_KEY`
- `.dev.vars.example` — Change to `OPENAI_API_KEY`
- `CLAUDE.md` — Update AI generation description
- `DEPLOYMENT.md` — Update secret setup
- `SESSION_HANDOFF.md` — Update with OpenAI instructions

---

## 💰 COST COMPARISON

### **Gemini (Previous)**
- Model: `gemini-2.5-flash-image`
- Cost: ~$0.000125 per image (estimated)
- Single API call

### **OpenAI (New)**
- **Step 1**: GPT-4o Vision — ~$0.01 per image
- **Step 2**: DALL-E 3 Standard — $0.04 per image
- **Total**: ~$0.05 per generation

**Cost increase**: ~40x higher, but produces better quality portraits

---

## ⚠️ ALTERNATIVE: DALL-E 3 Only (Lower Cost)

If cost is a concern, we can skip GPT-4 Vision and use DALL-E 3 with text prompts only:

**Pros**:
- Lower cost ($0.04 per generation)
- Simpler implementation (one API call)

**Cons**:
- ❌ Generated portraits won't match the uploaded pet
- ❌ User uploads a golden retriever, gets a generic golden retriever
- ❌ Poor user experience (not personalized)

**Recommendation**: Use the two-step approach for quality.

---

## 🔧 IMPLEMENTATION DETAILS

### **Error Handling**

**Gemini Errors**:
- 429: Rate limit
- 403: Invalid API key

**OpenAI Errors**:
- 429: Rate limit
- 401: Invalid API key
- 400: Invalid request (prompt too long, image too large)
- 500: OpenAI server error

### **Response Format**

**Gemini Response**:
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "inlineData": {
          "mimeType": "image/png",
          "data": "<base64>"
        }
      }]
    }
  }]
}
```

**OpenAI Response (DALL-E 3)**:
```json
{
  "data": [{
    "b64_json": "<base64>",
    "revised_prompt": "..."
  }]
}
```

### **Prompt Engineering Changes**

**Current Gemini Prompt** (works with image input):
```
"Create a royal-themed oil painting portrait of this pet..."
```

**New OpenAI Prompt** (needs pet description):
```
"Create a royal-themed oil painting portrait of a golden retriever with fluffy cream-colored coat and friendly expression, sitting regally..."
```

The GPT-4 Vision step provides this pet-specific detail.

---

## 📝 FILES TO MODIFY

1. ✅ `src/lib/generations.functions.ts` — Main generation logic
2. ✅ `src/lib/env.server.ts` — Environment variable type
3. ✅ `.env.example` — Documentation
4. ✅ `.dev.vars.example` — Documentation
5. ✅ `.dev.vars` — Local development
6. ✅ `CLAUDE.md` — Update architecture section
7. ✅ `DEPLOYMENT.md` — Update secret setup
8. ✅ `SESSION_HANDOFF.md` — Update instructions

---

## 🎯 NEXT STEPS

1. **Review this plan** — Approve two-step approach
2. **Get OpenAI API key** — From https://platform.openai.com/api-keys
3. **Apply code changes** — I'll implement the migration
4. **Set environment variable** — `wrangler secret put OPENAI_API_KEY`
5. **Test locally** — Verify generation works
6. **Deploy** — `npm run deploy`

---

**Estimated Time**: 30 minutes for implementation + testing

**Would you like me to proceed with the two-step approach (GPT-4 Vision + DALL-E 3)?**
