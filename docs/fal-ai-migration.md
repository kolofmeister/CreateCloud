# fal.ai Migration Notes

This project was migrated from MuAPI (`api.muapi.ai`) to fal.ai (`queue.fal.run`).
The following features and models could **not** be migrated because they have no equivalent on fal.ai.

---

## Features Not Available on fal.ai

### Workflows
MuAPI provided a full workflow builder with visual node editor, run history, and API execution.
fal.ai has no workflow backend. The following routes now return `503`:
- `GET/POST /api/workflow/*`

### Agents
MuAPI provided AI chat agents with persistent conversations, custom system prompts, and template agents.
fal.ai has no agent infrastructure. The following routes now return `503`:
- `GET/POST/PUT/DELETE /api/agents/*`

### Creative Agent
MuAPI-specific feature. Returns `503` at `/api/v1/creative-agent/*`.

### Account Balance API
`getUserBalance()` throws — check your fal.ai billing at https://fal.ai/dashboard/billing.

### AI Clipping
`runClipping()` throws — MuAPI-specific video highlight extraction feature.

### Motion Graphics
`runMotionGraphics()` / `runMotionGraphicsEdit()` throw — MuAPI-specific feature.

### Dynamic Cost Calculation
`calculateDynamicCost()` throws — MuAPI-specific pricing preview feature.

### App Interests
`registerAppInterest()` / `getAppInterests()` throw — MuAPI-specific feature.

---

## Models Not Available on fal.ai

These models cannot be accessed via fal.ai and are mapped to `null` in `FAL_MODEL_MAP`.

### Image Models
| Model | Reason |
|---|---|
| Midjourney v7 | No public API |
| AI Anime Generator | MuAPI-specific |
| Kling O1 Text-to-Image | Proprietary |
| Vidu Q2 Text-to-Image | Proprietary |
| LeonardoAI Phoenix / Lucid Origin | LeonardoAI API only |
| Bytedance Seedream v3 | Older version not on fal.ai |
| Perfect Pony XL, Neta Lumina | MuAPI-specific |

### Video Models
| Model | Reason |
|---|---|
| Runway T2V / Act-Two I2V | Runway API only |
| LeonardoAI Motion 2.0 | LeonardoAI API only |
| Wan2.2 Spicy | Content policy restricted |
| OVI Image-to-Video | Proprietary |
| Seedance v2.0 Extend | Extend feature not available |

### LipSync Models
| Model | Reason |
|---|---|
| Creatify LipSync | Creatify API only |
| InfiniteTalk Video-to-Video | V2V variant not on fal.ai |
| Wan2.2 Speech-to-Video | Not on fal.ai |

### Audio Models
| Model | Reason |
|---|---|
| Suno (all variants) | Suno API only — no public fal.ai integration |

---

## Models Available on fal.ai (Confirmed via MCP catalog)

Models previously thought unavailable that ARE on fal.ai:

| MuAPI Model | fal.ai Endpoint |
|---|---|
| Nano Banana | `fal-ai/nano-banana` |
| Nano Banana Pro | `fal-ai/nano-banana-pro` |
| Nano Banana 2 | `fal-ai/nano-banana-2` |
| GPT-4o Image | `fal-ai/gpt-image-1/text-to-image` |
| GPT-image-1.5 | `fal-ai/gpt-image-1.5` |
| GPT-image-2 | `openai/gpt-image-2` |
| Google Imagen4 / Fast | `fal-ai/gemini-25-flash-image` |
| Google Imagen4 Ultra | `fal-ai/gemini-3-pro-image-preview` |
| Grok Imagine (Image) | `xai/grok-imagine-image` |
| Qwen Image | `fal-ai/qwen-image` |
| Qwen T2I 2512 | `fal-ai/qwen-image-2512` |
| Bytedance Seedream v4 | `fal-ai/bytedance/seedream/v4/text-to-image` |
| Bytedance Seedream v4.5 | `fal-ai/bytedance/seedream/v4.5/text-to-image` |
| Seedream 5.0 | `fal-ai/bytedance/seedream/v5/lite/text-to-image` |
| Z-Image Turbo | `fal-ai/z-image/turbo` |
| Z-Image Base | `fal-ai/z-image/base` |
| FLUX 2 Flex | `fal-ai/flux-2-flex` |
| FLUX 2 Klein 4B | `fal-ai/flux-2/klein/4b` |
| FLUX 2 Klein 9B | `fal-ai/flux-2/klein/9b` |
| Hunyuan Image 3.0 | `fal-ai/hunyuan-image/v3/text-to-image` |
| Veo 3 / Veo 3 Fast | `fal-ai/veo3` / `fal-ai/veo3/fast` |
| Veo 3.1 / Fast / Lite | `fal-ai/veo3.1` / `fal-ai/veo3.1/fast` / `fal-ai/veo3.1/lite` |
| Veo 3.1 Image-to-Video | `fal-ai/veo3.1/image-to-video` |
| OpenAI Sora 2 (T2V) | `fal-ai/sora-2/text-to-video` |
| OpenAI Sora 2 Pro (T2V) | `fal-ai/sora-2/text-to-video/pro` |
| OpenAI Sora 2 (I2V) | `fal-ai/sora-2/image-to-video` |
| OpenAI Sora 2 Pro (I2V) | `fal-ai/sora-2/image-to-video/pro` |
| Grok Imagine Video | `xai/grok-imagine-video/text-to-video` |
| Grok Imagine Image-to-Video | `xai/grok-imagine-video/image-to-video` |
| Kling v3.0 Pro T2V | `fal-ai/kling-video/v3/pro/text-to-video` |
| Kling v3.0 Standard T2V | `fal-ai/kling-video/v3/standard/text-to-video` |
| Kling v3.0 Pro I2V | `fal-ai/kling-video/v3/pro/image-to-video` |
| Kling v3.0 4K I2V | `fal-ai/kling-video/v3/4k/image-to-video` |
| Kling O1 I2V | `fal-ai/kling-video/o1/image-to-video` |
| Pixverse v4.5–v6 | `fal-ai/pixverse/v4.5/image-to-video` etc. |
| Vidu Q2/Q3 | `fal-ai/vidu/q3/image-to-video` |
| MiniMax Hailuo 02 (I2V/T2V) | `fal-ai/minimax/hailuo-02/standard/image-to-video` etc. |
| MiniMax Hailuo 2.3 family | `fal-ai/minimax/hailuo-2.3/pro/image-to-video` etc. |
| Seedance v2.0 (T2V/I2V) | `bytedance/seedance-2.0/text-to-video` etc. |
| Veed LipSync | `veed/lipsync` |
| InfiniteTalk (I2V) | `fal-ai/infinitalk` |
| MiniMax Voice Clone | `fal-ai/minimax/voice-clone` |
| MiniMax Speech 2.6 HD | `fal-ai/minimax/speech-2.6-hd` |
| MiniMax Speech 2.6 Turbo | `fal-ai/minimax/speech-2.6-turbo` |
| MiniMax Speech 2.8 HD | `fal-ai/minimax/speech-2.8-hd` |

---

## API Changes

### Authentication
| Before (MuAPI) | After (fal.ai) |
|---|---|
| Header: `x-api-key: {key}` | Header: `Authorization: Key {key}` |
| localStorage key: `muapi_key` | localStorage key: `falai_key` |
| Cookie: `muapi_key` | Cookie: `falai_key` |

### Proxy Routes
| Before | After |
|---|---|
| `/api/v1/*` → `https://api.muapi.ai/api/v1/*` | `/api/fal/*` → `https://queue.fal.run/*` |
| `/api/app/*` → MuAPI app endpoints | `/api/fal-storage/*` → `https://rest.alpha.fal.ai/*` |

### File Upload
| Before (MuAPI) | After (fal.ai) |
|---|---|
| `POST /api/v1/upload_file` (multipart) | `POST /api/fal-storage/storage/upload/initiate` → then `PUT` to presigned URL |

### Response Format
| Before (MuAPI) | After (fal.ai) |
|---|---|
| `result.outputs[0]` or `result.url` | `result.images[0].url` (images) or `result.video.url` (video) |
| Both normalized to `result.url` by the client | Both normalized to `result.url` by `normalizeOutput()` |
