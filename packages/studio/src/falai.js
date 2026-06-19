import { getModelById, getVideoModelById, getI2IModelById, getI2VModelById, getV2VModelById, getLipSyncModelById, getAudioModelById } from './models.js';

// Browser (http/https): proxy through Next.js to avoid CORS
// Electron (file://): call fal.ai directly
const QUEUE_BASE = (typeof window !== 'undefined' && window.location?.protocol?.startsWith('http'))
    ? '/api/fal'
    : 'https://queue.fal.run';

const STORAGE_BASE = (typeof window !== 'undefined' && window.location?.protocol?.startsWith('http'))
    ? '/api/fal-storage'
    : 'https://rest.alpha.fal.ai';

// Maps MuAPI model IDs to fal.ai queue model IDs.
// null = model not available on fal.ai (proprietary or no public API).
const FAL_MODEL_MAP = {
    // ── Text-to-Image ──────────────────────────────────────────────────────────
    'flux-dev':                       'fal-ai/flux/dev',
    'flux-dev-lora':                  'fal-ai/flux-lora',
    'flux-kontext-dev-t2i':           'fal-ai/flux-pro/kontext/text-to-image',
    'flux-kontext-pro-t2i':           'fal-ai/flux-pro/kontext/text-to-image',
    'flux-kontext-max-t2i':           'fal-ai/flux-pro/kontext/max/text-to-image',
    'flux-schnell':                   'fal-ai/flux/schnell',
    'flux-pulid':                     'fal-ai/flux/pulid',
    'flux-redux':                     'fal-ai/flux-pro/redux',
    'flux-krea-dev':                  'fal-ai/flux/krea',
    'flux-2-dev':                     'fal-ai/flux-2',
    'flux-2-pro':                     'fal-ai/flux-2-max',
    'flux-2-flex':                    'fal-ai/flux-2-flex',
    'flux-2-klein-4b':                'fal-ai/flux-2/klein/4b',
    'flux-2-klein-9b':                'fal-ai/flux-2/klein/9b',
    'hidream-i1-fast':                'fal-ai/hidream-i1-fast',
    'hidream-i1-dev':                 'fal-ai/hidream-i1',
    'hidream-i1-full':                'fal-ai/hidream-i1-full',
    'wan2.1-text-to-image':           'fal-ai/wan/v2.7/text-to-image',
    'wan2.5-text-to-image':           'fal-ai/wan-25-preview/text-to-image',
    'wan2.6-text-to-image':           'wan/v2.6/text-to-image',
    'sdxl-image':                     'fal-ai/stable-diffusion-xl',
    'ideogram-v3-t2i':                'fal-ai/ideogram/v3',
    'hunyuan-image-2.1':              'fal-ai/hunyuan-image/v3/text-to-image',
    'hunyuan-image-3.0':              'fal-ai/hunyuan-image/v3/text-to-image',
    'chroma-image':                   'fal-ai/chroma',
    'reve-text-to-image':             'fal-ai/recraft/v4/text-to-image',
    'minimax-image-01':               'fal-ai/minimax/image-01',
    'nano-banana':                    'fal-ai/nano-banana',
    'nano-banana-pro':                'fal-ai/nano-banana-pro',
    'nano-banana-2':                  'fal-ai/nano-banana-2',
    'gpt4o-text-to-image':            'fal-ai/gpt-image-1/text-to-image',
    'gpt-image-1.5':                  'fal-ai/gpt-image-1.5',
    'gpt-image-2':                    'openai/gpt-image-2',
    'google-imagen4':                 'fal-ai/gemini-25-flash-image',
    'google-imagen4-fast':            'fal-ai/gemini-25-flash-image',
    'google-imagen4-ultra':           'fal-ai/gemini-3-pro-image-preview',
    'grok-imagine-text-to-image':     'xai/grok-imagine-image',
    'qwen-image':                     'fal-ai/qwen-image',
    'qwen-text-to-image-2512':        'fal-ai/qwen-image-2512',
    'bytedance-seedream-v4':          'fal-ai/bytedance/seedream/v4/text-to-image',
    'bytedance-seedream-v4.5':        'fal-ai/bytedance/seedream/v4.5/text-to-image',
    'seedream-5.0':                   'fal-ai/bytedance/seedream/v5/lite/text-to-image',
    'z-image-turbo':                  'fal-ai/z-image/turbo',
    'z-image-base':                   'fal-ai/z-image/base',
    // No fal.ai equivalent:
    'ai-anime-generator':             null,
    'midjourney-v7-text-to-image':    null,
    'kling-o1-text-to-image':         null,
    'vidu-q2-text-to-image':          null,
    'leonardoai-phoenix-1.0':         null,
    'leonardoai-lucid-origin':        null,
    'bytedance-seedream-v3':          null,
    'perfect-pony-xl':                null,
    'neta-lumina':                    null,

    // ── Text-to-Video ──────────────────────────────────────────────────────────
    'wan2.1-text-to-video':           'fal-ai/wan-t2v',
    'wan2.2-text-to-video':           'fal-ai/wan/v2.2-a14b/text-to-video',
    'wan2.2-5b-fast-t2v':             'fal-ai/wan/v2.2-5b/text-to-video',
    'wan2.5-text-to-video':           'fal-ai/wan-25-preview/text-to-video',
    'wan2.5-text-to-video-fast':      'fal-ai/wan/v2.2-5b/text-to-video/fast-wan',
    'wan2.6-text-to-video':           'wan/v2.6/text-to-video',
    'wan2.7-text-to-video':           'fal-ai/wan/v2.7/text-to-video',
    'kling-v2.1-master-t2v':          'fal-ai/kling-video/v2.1/master/text-to-video',
    'kling-v2.5-turbo-pro-t2v':       'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
    'kling-v2.6-pro-t2v':             'fal-ai/kling-video/v2.6/pro/text-to-video',
    'kling-v3.0-pro-text-to-video':   'fal-ai/kling-video/v3/pro/text-to-video',
    'kling-v3.0-standard-text-to-video': 'fal-ai/kling-video/v3/standard/text-to-video',
    'kling-o1-text-to-video':         'fal-ai/kling-video/o3/pro/text-to-video',
    'veo3-text-to-video':             'fal-ai/veo3',
    'veo3-fast-text-to-video':        'fal-ai/veo3/fast',
    'veo3.1-text-to-video':           'fal-ai/veo3.1',
    'veo3.1-fast-text-to-video':      'fal-ai/veo3.1/fast',
    'veo3.1-lite-text-to-video':      'fal-ai/veo3.1/lite',
    'sora-2-text-to-video':           'fal-ai/sora-2/text-to-video',
    'sora-2-pro-text-to-video':       'fal-ai/sora-2/text-to-video/pro',
    'grok-imagine-text-to-video':     'xai/grok-imagine-video/text-to-video',
    'hunyuan-text-to-video':          'fal-ai/hunyuan-video',
    'hunyuan-fast-text-to-video':     'fal-ai/hunyuan-video-v1.5/text-to-video',
    'hunyuan-image-to-video':         'fal-ai/hunyuan-video-image-to-video',
    'seedance-lite-t2v':              'fal-ai/bytedance/seedance/v1/pro/text-to-video',
    'seedance-pro-t2v':               'fal-ai/bytedance/seedance/v1/pro/text-to-video',
    'seedance-pro-t2v-fast':          'fal-ai/bytedance/seedance/v1/pro/fast/text-to-video',
    'seedance-v1.5-pro-t2v':          'fal-ai/bytedance/seedance/v1.5/pro/text-to-video',
    'seedance-v1.5-pro-t2v-fast':     'fal-ai/bytedance/seedance/v1.5/pro/text-to-video',
    'seedance-v2.0-t2v':              'bytedance/seedance-2.0/text-to-video',
    'seedance-v2.0-fast-t2v':         'bytedance/seedance-2.0/fast/text-to-video',
    // No fal.ai equivalent:
    'runway-text-to-video':           null,
    'seedance-v2.0-extend':           null,

    // ── Image-to-Video ─────────────────────────────────────────────────────────
    'kling-v2.1-master-i2v':          'fal-ai/kling-video/v2.1/master/image-to-video',
    'kling-v2.1-standard-i2v':        'fal-ai/kling-video/v2.1/standard/image-to-video',
    'kling-v2.1-pro-i2v':             'fal-ai/kling-video/v2.1/pro/image-to-video',
    'kling-v2.5-turbo-pro-i2v':       'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
    'kling-v2.5-turbo-std-i2v':       'fal-ai/kling-video/v2.5-turbo/standard/image-to-video',
    'kling-v2.6-pro-i2v':             'fal-ai/kling-video/v2.6/pro/image-to-video',
    'kling-v3.0-pro-image-to-video':  'fal-ai/kling-video/v3/pro/image-to-video',
    'kling-v3.0-standard-image-to-video': 'fal-ai/kling-video/v3/standard/image-to-video',
    'kling-v3.0-omni-standard-image-to-video': 'fal-ai/kling-video/v3/standard/image-to-video',
    'kling-v3.0-omni-pro-image-to-video': 'fal-ai/kling-video/v3/pro/image-to-video',
    'kling-v3.0-omni-4k-image-to-video': 'fal-ai/kling-video/v3/4k/image-to-video',
    'kling-o1-image-to-video':        'fal-ai/kling-video/o1/image-to-video',
    'kling-o1-reference-to-video':    'fal-ai/kling-video/o1/reference-to-video',
    'kling-o1-standard-image-to-video': 'fal-ai/kling-video/o1/standard/image-to-video',
    'kling-o1-standard-reference-to-video': 'fal-ai/kling-video/o1/reference-to-video',
    'wan2.1-reference-video':         'fal-ai/wan-i2v',
    'wan2.2-image-to-video':          'fal-ai/wan/v2.2-a14b/image-to-video',
    'wan2.5-image-to-video':          'fal-ai/wan-25-preview/image-to-video',
    'wan2.5-image-to-video-fast':     'fal-ai/wan/v2.2-5b/image-to-video',
    'wan2.6-image-to-video':          'wan/v2.6/image-to-video',
    'wan2.7-image-to-video':          'fal-ai/wan/v2.7/image-to-video',
    'ltx-2-pro-image-to-video':       'fal-ai/ltx-2/image-to-video',
    'ltx-2-fast-image-to-video':      'fal-ai/ltx-2/image-to-video/fast',
    'ltx-2-19b-image-to-video':       'fal-ai/ltx-2-19b/image-to-video',
    'minimax-hailuo-02-standard-i2v': 'fal-ai/minimax/hailuo-02/standard/image-to-video',
    'minimax-hailuo-02-pro-i2v':      'fal-ai/minimax/hailuo-02/pro/image-to-video',
    'minimax-hailuo-2.3-pro-i2v':     'fal-ai/minimax/hailuo-2.3/pro/image-to-video',
    'minimax-hailuo-2.3-standard-i2v': 'fal-ai/minimax/hailuo-2.3/standard/image-to-video',
    'minimax-hailuo-2.3-fast':        'fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video',
    'veo3.1-image-to-video':          'fal-ai/veo3.1/image-to-video',
    'veo3.1-fast-image-to-video':     'fal-ai/veo3.1/fast/image-to-video',
    'veo3.1-lite-image-to-video':     'fal-ai/veo3.1/lite/image-to-video',
    'veo3.1-reference-to-video':      'fal-ai/veo3.1/reference-to-video',
    'openai-sora-2-image-to-video':   'fal-ai/sora-2/image-to-video',
    'openai-sora-2-pro-image-to-video': 'fal-ai/sora-2/image-to-video/pro',
    'grok-imagine-image-to-video':    'xai/grok-imagine-video/image-to-video',
    'pixverse-v4.5-i2v':              'fal-ai/pixverse/v4.5/image-to-video',
    'pixverse-v5-i2v':                'fal-ai/pixverse/v5/image-to-video',
    'pixverse-v5.5-i2v':              'fal-ai/pixverse/v5.5/image-to-video',
    'pixverse-v6-i2v':                'fal-ai/pixverse/v6/image-to-video',
    'vidu-v2.0-i2v':                  'fal-ai/vidu/q3/image-to-video',
    'vidu-q1-reference':              'fal-ai/vidu/q3/image-to-video',
    'vidu-q2-reference':              'fal-ai/vidu/q3/image-to-video',
    'vidu-q2-turbo-start-end-video':  'fal-ai/vidu/q3/image-to-video/turbo',
    'vidu-q2-pro-start-end-video':    'fal-ai/vidu/q3/image-to-video',
    'seedance-lite-i2v':              'fal-ai/bytedance/seedance/v1/pro/image-to-video',
    'seedance-pro-i2v':               'fal-ai/bytedance/seedance/v1/pro/image-to-video',
    'seedance-pro-i2v-fast':          'fal-ai/bytedance/seedance/v1/pro/fast/image-to-video',
    'seedance-v1.5-pro-i2v':          'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
    'seedance-v1.5-pro-i2v-fast':     'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
    'seedance-v2.0-i2v':              'bytedance/seedance-2.0/image-to-video',
    'seedance-v2.0-fast-i2v':         'bytedance/seedance-2.0/fast/image-to-video',
    'seedance-lite-reference-video':  'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
    // No fal.ai equivalent:
    'runway-act-two-i2v':             null,
    'ovi-image-to-video':             null,
    'leonardoai-motion-2.0':          null,
    'wan2.2-spicy-image-to-video':    null,

    // ── Video-to-Video ─────────────────────────────────────────────────────────
    'video-watermark-remover':        null,
    'kling-v2.6-std-motion-control':  null,
    'kling-v3.0-std-motion-control':  null,
    'kling-v3.0-pro-motion-control':  null,

    // ── LipSync ────────────────────────────────────────────────────────────────
    'infinitetalk-image-to-video':    'fal-ai/infinitalk',
    'ltx-2.3-lipsync':                'fal-ai/sync-lipsync/v3',
    'ltx-2-19b-lipsync':              'fal-ai/sync-lipsync/v3',
    'sync-lipsync':                   'fal-ai/sync-lipsync/v3',
    'sync-lipsync-v2':                'fal-ai/sync-lipsync/v2',
    'latent-sync':                    'fal-ai/latentsync',
    'veed-lipsync':                   'veed/lipsync',
    // No fal.ai equivalent:
    'creatify-lipsync':               null,
    'infinitetalk-video-to-video':    null,
    'wan2.2-speech-to-video':         null,

    // ── Audio / Speech ─────────────────────────────────────────────────────────
    'mmaudio-v2-text-to-audio':       'fal-ai/mmaudio-v2',
    'lyria2-music':                   'fal-ai/lyria2',
    'minimax-voice-clone':            'fal-ai/minimax/voice-clone',
    'minimax-speech-2.6-hd':          'fal-ai/minimax/speech-2.6-hd',
    'minimax-speech-2.6-turbo':       'fal-ai/minimax/speech-2.6-turbo',
    'minimax-speech-2.8-hd':          'fal-ai/minimax/speech-2.8-hd',
    // Suno has no fal.ai integration:
    'suno-create-music':              null,
    'suno-remix-music':               null,
    'suno-extend-music':              null,
    'suno-generate-sounds':           null,
    'suno-add-vocals':                null,
    'suno-generate-mashup':           null,
    'suno-add-instrumental':          null,
    'suno-voice-clone':               null,

    // ── Video effects (V2V) ────────────────────────────────────────────────────
    'video-effects':                  null,
};

function getFalModelId(modelId) {
    if (modelId in FAL_MODEL_MAP) return FAL_MODEL_MAP[modelId];
    return modelId;
}

export function isFalAvailable(modelId) {
    if (!(modelId in FAL_MODEL_MAP)) return true;
    return FAL_MODEL_MAP[modelId] !== null;
}

// Pricing per fal.ai endpoint (unit: 'image' | 'megapixel' | 'second' | 'char' | 'unit')
const FAL_PRICE_MAP = {
    // ── Image models ─────────────────────────────────────────────────────────
    'fal-ai/nano-banana':                               { price: 0.0398,  unit: 'image' },
    'fal-ai/nano-banana-pro':                           { price: 0.15,    unit: 'image' },
    'fal-ai/nano-banana-2':                             { price: 0.08,    unit: 'image' },
    'fal-ai/flux-pro':                                  { price: 0.05,    unit: 'megapixel' },
    'fal-ai/flux-pro/v1.1':                             { price: 0.04,    unit: 'megapixel' },
    'fal-ai/flux-pro/v1.1-ultra':                       { price: 0.06,    unit: 'image' },
    'fal-ai/stable-diffusion-v3-medium':                { price: 0.035,   unit: 'image' },
    'fal-ai/ideogram/v2':                               { price: 0.08,    unit: 'image' },
    'fal-ai/ideogram/v2/turbo':                         { price: 0.05,    unit: 'image' },
    'fal-ai/recraft-v3':                                { price: 0.04,    unit: 'image' },
    'fal-ai/gpt-image-1/text-to-image':                 { price: 1.00,    unit: 'image' },
    'fal-ai/gpt-image-1.5':                             { price: 1.00,    unit: 'image' },
    'openai/gpt-image-2':                               { price: 1.00,    unit: 'image' },
    'fal-ai/gemini-25-flash-image':                     { price: 0.0398,  unit: 'image' },
    'fal-ai/gemini-3-pro-image-preview':                { price: 0.15,    unit: 'image' },
    'xai/grok-imagine-image':                           { price: 0.02,    unit: 'image' },
    'fal-ai/qwen-image':                                { price: 0.02,    unit: 'megapixel' },
    'fal-ai/qwen-image-2512':                           { price: 0.02,    unit: 'megapixel' },
    'fal-ai/bytedance/seedream/v4/text-to-image':       { price: 0.03,    unit: 'image' },
    'fal-ai/bytedance/seedream/v4.5/text-to-image':     { price: 0.04,    unit: 'image' },
    'fal-ai/bytedance/seedream/v5/lite/text-to-image':  { price: 0.035,   unit: 'image' },
    'fal-ai/z-image/turbo':                             { price: 0.005,   unit: 'megapixel' },
    'fal-ai/z-image/base':                              { price: 0.01,    unit: 'megapixel' },
    'fal-ai/flux-2-flex':                               { price: 0.05,    unit: 'megapixel' },
    'fal-ai/flux-2':                                    { price: 0.00167, unit: 'compute_second' },
    'fal-ai/flux-2-max':                                { price: 0.07,    unit: 'megapixel' },
    'fal-ai/flux-2/klein/4b':                           { price: 0.009,   unit: 'megapixel' },
    'fal-ai/flux-2/klein/9b':                           { price: 0.011,   unit: 'megapixel' },
    'fal-ai/hunyuan-image/v3/text-to-image':            { price: 0.10,    unit: 'megapixel' },
    'fal-ai/flux-pro/kontext/text-to-image':            { price: 0.04,    unit: 'image' },
    'fal-ai/flux-pro/kontext/max/text-to-image':        { price: 0.08,    unit: 'image' },
    'fal-ai/flux/krea':                                 { price: 0.025,   unit: 'megapixel' },
    'fal-ai/flux/dev':                                  { price: 0.025,   unit: 'megapixel' },
    'fal-ai/flux-lora':                                 { price: 0.035,   unit: 'megapixel' },
    'fal-ai/flux/schnell':                              { price: 0.003,   unit: 'megapixel' },
    'fal-ai/flux/pulid':                                { price: 0.0008,  unit: 'compute_second' },
    'fal-ai/flux-pro/redux':                            { price: 0.00017, unit: 'compute_second' },
    'fal-ai/hidream-i1-fast':                           { price: 0.01,    unit: 'megapixel' },
    'fal-ai/hidream-i1-full':                           { price: 0.05,    unit: 'megapixel' },
    'fal-ai/wan/v2.7/text-to-image':                    { price: 0.03,    unit: 'image' },
    'fal-ai/wan-25-preview/text-to-image':              { price: 0.05,    unit: 'image' },
    'wan/v2.6/text-to-image':                           { price: 0.00007, unit: 'compute_second' },
    'fal-ai/ideogram/v3':                               { price: 0.03,    unit: 'image' },
    'fal-ai/recraft/v4/text-to-image':                  { price: 0.04,    unit: 'image' },
    'fal-ai/minimax/image-01':                          { price: 0.01,    unit: 'image' },
    // ── Text-to-Video ─────────────────────────────────────────────────────────
    'fal-ai/veo3':                                      { price: 0.40,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/veo3/fast':                                 { price: 0.15,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/veo3.1':                                    { price: 0.40,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/veo3.1/fast':                               { price: 0.15,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/veo3.1/lite':                               { price: 0.05,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/sora-2/text-to-video':                      { price: 0.10,    unit: 'second',  defaultDuration: 10 },
    'fal-ai/sora-2/text-to-video/pro':                  { price: 0.10,    unit: 'second',  defaultDuration: 10 },
    'fal-ai/kling-video/v3/pro/text-to-video':          { price: 0.14,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v3/standard/text-to-video':     { price: 0.14,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v2.1/pro/text-to-video':        { price: 0.00017, unit: 'compute_second', defaultDuration: 5 },
    'fal-ai/kling-video/v2.1/standard/text-to-video':   { price: 0.00017, unit: 'compute_second', defaultDuration: 5 },
    'fal-ai/kling-video/v2.5/pro/text-to-video':        { price: 0.00017, unit: 'compute_second', defaultDuration: 5 },
    'fal-ai/wan/v2.2-a14b/text-to-video':               { price: 0.08,    unit: 'second',  defaultDuration: 5 },
    'wan/v2.6/text-to-video':                           { price: 0.10,    unit: 'second',  defaultDuration: 5 },
    'bytedance/seedance-2.0/text-to-video':             { price: 0.10,    unit: 'second', defaultDuration: 5 },
    'fal-ai/minimax/hailuo-02/standard/text-to-video':  { price: 0.045,   unit: 'second',  defaultDuration: 6 },
    'fal-ai/minimax/hailuo-02/pro/text-to-video':       { price: 0.08,    unit: 'second',  defaultDuration: 6 },
    'xai/grok-imagine-video/text-to-video':             { price: 0.05,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/wan-t2v':                                   { price: 0.4,     unit: 'unit' },
    'fal-ai/wan/v2.2-5b/text-to-video':                 { price: 0.15,    unit: 'unit' },
    'fal-ai/wan-25-preview/text-to-video':              { price: 0.05,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/wan/v2.2-5b/text-to-video/fast-wan':        { price: 0.025,   unit: 'unit' },
    'fal-ai/kling-video/v2.1/master/text-to-video':     { price: 0.28,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v2.5-turbo/pro/text-to-video':  { price: 0.07,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v2.6/pro/text-to-video':        { price: 0.07,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/o3/pro/text-to-video':          { price: 0.14,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/hunyuan-video':                             { price: 0.4,     unit: 'unit' },
    'fal-ai/hunyuan-video-v1.5/text-to-video':          { price: 0.075,   unit: 'second',  defaultDuration: 5 },
    'fal-ai/hunyuan-video-image-to-video':              { price: 0.4,     unit: 'unit' },
    'fal-ai/bytedance/seedance/v1/pro/text-to-video':   { price: 1.20,    unit: 'unit' },
    'fal-ai/bytedance/seedance/v1/pro/fast/text-to-video': { price: 0.50, unit: 'unit' },
    'fal-ai/bytedance/seedance/v1.5/pro/text-to-video': { price: 0.60,    unit: 'unit' },
    'bytedance/seedance-2.0/fast/text-to-video':        { price: 0.0112,  unit: 'unit' },
    // ── Image-to-Video ────────────────────────────────────────────────────────
    'fal-ai/veo3.1/image-to-video':                     { price: 0.40,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/sora-2/image-to-video':                     { price: 0.10,    unit: 'second',  defaultDuration: 10 },
    'fal-ai/sora-2/image-to-video/pro':                 { price: 0.10,    unit: 'second',  defaultDuration: 10 },
    'xai/grok-imagine-video/image-to-video':            { price: 0.05,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v3/pro/image-to-video':         { price: 0.14,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v3/4k/image-to-video':          { price: 0.42,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/o1/image-to-video':             { price: 0.112,   unit: 'second',  defaultDuration: 5 },
    'fal-ai/wan/v2.2-a14b/image-to-video':              { price: 0.08,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/pixverse/v4.5/image-to-video':              { price: 0.05,    unit: 'unit' },
    'fal-ai/pixverse/v5/image-to-video':                { price: 0.05,    unit: 'unit' },
    'fal-ai/pixverse/v5.5/image-to-video':              { price: 0.05,    unit: 'unit' },
    'fal-ai/minimax/hailuo-02/standard/image-to-video': { price: 0.045,   unit: 'second',  defaultDuration: 6 },
    'fal-ai/minimax/hailuo-02/pro/image-to-video':      { price: 0.08,    unit: 'second',  defaultDuration: 6 },
    'fal-ai/minimax/hailuo-2.3/pro/image-to-video':     { price: 0.49,    unit: 'unit' },
    'bytedance/seedance-2.0/image-to-video':            { price: 0.10,    unit: 'second', defaultDuration: 5 },
    'fal-ai/kling-video/v2.1/master/image-to-video':    { price: 0.28,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v2.1/standard/image-to-video':  { price: 0.056,   unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v2.1/pro/image-to-video':       { price: 0.098,   unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v2.5-turbo/pro/image-to-video': { price: 0.07,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v2.5-turbo/standard/image-to-video': { price: 0.042, unit: 'second', defaultDuration: 5 },
    'fal-ai/kling-video/v2.6/pro/image-to-video':       { price: 0.07,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/v3/standard/image-to-video':    { price: 0.14,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/o1/standard/image-to-video':    { price: 0.084,   unit: 'second',  defaultDuration: 5 },
    'fal-ai/kling-video/o1/reference-to-video':         { price: 0.112,   unit: 'second',  defaultDuration: 5 },
    'fal-ai/wan-i2v':                                   { price: 0.4,     unit: 'unit' },
    'fal-ai/wan-25-preview/image-to-video':             { price: 0.05,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/wan/v2.2-5b/image-to-video':                { price: 0.15,    unit: 'unit' },
    'fal-ai/ltx-2/image-to-video':                      { price: 0.06,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/ltx-2/image-to-video/fast':                 { price: 0.04,    unit: 'second',  defaultDuration: 5 },
    'fal-ai/ltx-2-19b/image-to-video':                  { price: 0.0018,  unit: 'megapixel' },
    'fal-ai/minimax/hailuo-2.3/standard/image-to-video': { price: 0.28,   unit: 'unit' },
    'fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video': { price: 0.19, unit: 'unit' },
    'fal-ai/veo3.1/fast/image-to-video':                { price: 0.15,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/veo3.1/lite/image-to-video':                { price: 0.05,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/veo3.1/reference-to-video':                 { price: 0.40,    unit: 'second',  defaultDuration: 8 },
    'fal-ai/sora-2/image-to-video/pro':                 { price: 0.10,    unit: 'second',  defaultDuration: 10 },
    'fal-ai/pixverse/v6/image-to-video':                { price: 0.005,   unit: 'second',  defaultDuration: 5 },
    'fal-ai/vidu/q3/image-to-video':                    { price: 0.07,    unit: 'unit' },
    'fal-ai/vidu/q3/image-to-video/turbo':              { price: 0.035,   unit: 'unit' },
    'fal-ai/bytedance/seedance/v1/pro/image-to-video':  { price: 1.20,    unit: 'unit' },
    'fal-ai/bytedance/seedance/v1/pro/fast/image-to-video': { price: 0.50, unit: 'unit' },
    'fal-ai/bytedance/seedance/v1.5/pro/image-to-video': { price: 0.60,   unit: 'unit' },
    'bytedance/seedance-2.0/fast/image-to-video':       { price: 0.0112,  unit: 'unit' },
    // ── LipSync ───────────────────────────────────────────────────────────────
    'veed/lipsync':                                     { price: 0.000575, unit: 'compute_second' },
    'fal-ai/infinitalk':                                { price: 0.20,    unit: 'second',  defaultDuration: 10 },
    'fal-ai/sync-lipsync/v3':                           { price: 8.00,    unit: 'minute' },
    'fal-ai/sync-lipsync/v2':                           { price: 3.00,    unit: 'minute' },
    'fal-ai/latentsync':                                { price: 0.005,   unit: 'second',  defaultDuration: 10 },
    // ── Audio / Speech ────────────────────────────────────────────────────────
    'fal-ai/minimax/voice-clone':                       { price: 1.50,    unit: 'unit' },
    'fal-ai/minimax/speech-2.6-hd':                     { price: 0.10,    unit: '1k_chars' },
    'fal-ai/minimax/speech-2.6-turbo':                  { price: 0.06,    unit: '1k_chars' },
    'fal-ai/minimax/speech-2.8-hd':                     { price: 0.10,    unit: '1k_chars' },
    'fal-ai/lyria2':                                    { price: 0.10,    unit: 'unit' },
    'fal-ai/stable-audio':                              { price: 0.000575, unit: 'compute_second' },
    'fal-ai/mmaudio-v2':                                { price: 0.001,   unit: 'second',  defaultDuration: 30 },
};

// Approximate megapixels for resolution strings used by fal.ai models
const RESOLUTION_TO_MP = {
    '1k': 1.0, '2k': 2.0, '4k': 4.0,
    '720p': 0.9, '1080p': 2.1, '2160p': 8.3,
    'standard': 1.0, 'hd': 2.1, 'ultra': 4.0,
};

// Typical compute seconds for "compute_second" billed models (approximation)
const COMPUTE_SECOND_ESTIMATE = {
    'fal-ai/flux-2': 30,
    'fal-ai/aura-flow': 25,
    'veed/lipsync': 120,
    'fal-ai/stable-audio': 60,
    'fal-ai/kling-video/v2.1/pro/text-to-video': 180,
    'fal-ai/kling-video/v2.1/standard/text-to-video': 180,
    'fal-ai/kling-video/v2.5/pro/text-to-video': 180,
    'fal-ai/flux/pulid': 30,
    'fal-ai/flux-pro/redux': 30,
    'wan/v2.6/text-to-image': 30,
};

/**
 * Estimate cost for a generation. Returns { low, high, label, note } or null.
 * - muapiModelId: the key in FAL_MODEL_MAP
 * - count: number of images (image models only)
 * - resolution: string like "1k", "4k", "1080p" (megapixel-priced models)
 * - duration: video duration in seconds (video models)
 */
export function estimateCost(muapiModelId, { count = 1, resolution = null, duration = null } = {}) {
    const falId = FAL_MODEL_MAP[muapiModelId];
    if (!falId) return null;
    const info = FAL_PRICE_MAP[falId];
    if (!info) return null;

    const fmt = (n) => n < 0.01 ? '<$0.01' : `~$${n.toFixed(2)}`;

    if (info.unit === 'image') {
        const total = info.price * count;
        return { cost: total, label: fmt(total), perUnit: `$${info.price}/Bild`, note: null };
    }

    if (info.unit === 'megapixel') {
        const mp = (resolution && RESOLUTION_TO_MP[resolution]) || 1.0;
        const total = info.price * mp * count;
        const hi = info.price * ((RESOLUTION_TO_MP['4k'] || 4) * count);
        return {
            cost: total,
            label: fmt(total),
            perUnit: `$${info.price}/MP`,
            note: mp > 1 ? `${mp}MP` : null,
        };
    }

    if (info.unit === 'second') {
        const secs = duration ?? info.defaultDuration ?? 5;
        const total = info.price * secs;
        return { cost: total, label: fmt(total), perUnit: `$${info.price}/Sek.`, note: `${secs}s` };
    }

    if (info.unit === 'minute') {
        const mins = duration ? duration / 60 : 10 / 60;
        const total = info.price * mins;
        return { cost: total, label: fmt(total), perUnit: `$${info.price}/Min.`, note: null };
    }

    if (info.unit === 'compute_second') {
        const approx = COMPUTE_SECOND_ESTIMATE[falId] || 60;
        const total = info.price * approx;
        return { cost: total, label: fmt(total), perUnit: null, note: 'variabel' };
    }

    if (info.unit === '1k_chars') {
        return { cost: info.price, label: `$${info.price}/1k Zeichen`, perUnit: null, note: 'je Textlänge' };
    }

    if (info.unit === 'unit') {
        return { cost: info.price, label: fmt(info.price), perUnit: null, note: null };
    }

    return null;
}

function notifyAuthRequired(status, detail) {
    if (typeof window === 'undefined') return;
    if (status !== 401 && status !== 403) return;
    window.dispatchEvent(new CustomEvent('muapi:auth-required', { detail: { status, message: detail } }));
}

function falHeaders(apiKey) {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
    };
}

async function pollForResult(falModelId, requestId, apiKey, maxAttempts = 900, interval = 2000, statusUrl, resultUrl) {
    const authHeaders = { 'Authorization': `Key ${apiKey}` };
    statusUrl = statusUrl || `${QUEUE_BASE}/${falModelId}/requests/${requestId}/status`;
    resultUrl = resultUrl || `${QUEUE_BASE}/${falModelId}/requests/${requestId}`;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        await new Promise(resolve => setTimeout(resolve, interval));
        try {
            const res = await fetch(statusUrl, { headers: authHeaders });
            if (!res.ok) {
                const errText = await res.text();
                if (res.status >= 500) continue;
                notifyAuthRequired(res.status, errText);
                throw new Error(`Poll Failed: ${res.status} - ${errText.slice(0, 100)}`);
            }
            const data = await res.json();
            const status = data.status?.toUpperCase();
            if (status === 'COMPLETED') {
                if (data.error) throw new Error(`Generation failed: ${data.error}`);
                const resultRes = await fetch(resultUrl, { headers: authHeaders });
                if (!resultRes.ok) {
                    const errText = await resultRes.text();
                    throw new Error(`Result fetch failed: ${resultRes.status} - ${errText.slice(0, 100)}`);
                }
                return await resultRes.json();
            }
            if (status === 'FAILED') {
                throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
            }
        } catch (error) {
            if (attempt === maxAttempts) throw error;
        }
    }
    throw new Error('Generation timed out after polling.');
}

function normalizeOutput(result) {
    const url = result.images?.[0]?.url
        || result.image?.url
        || result.video?.url
        || result.videos?.[0]?.url
        || result.audio?.url
        || result.audio_url
        || result.url;
    return { ...result, url };
}

async function submitAndPoll(falModelId, payload, apiKey, onRequestId, maxAttempts = 60) {
    const submitUrl = `${QUEUE_BASE}/${falModelId}`;
    const res = await fetch(submitUrl, {
        method: 'POST',
        headers: falHeaders(apiKey),
        body: JSON.stringify(payload),
    });
    if (!res.ok) {
        const errText = await res.text();
        notifyAuthRequired(res.status, errText);
        throw new Error(`API Request Failed: ${res.status} ${res.statusText} - ${errText.slice(0, 100)}`);
    }
    const submitData = await res.json();
    const requestId = submitData.request_id;
    if (!requestId) {
        // Synchronous result (no queue)
        return normalizeOutput(submitData);
    }
    if (onRequestId) onRequestId(requestId);
    // fal.ai status_url may use a shortened path (e.g. bytedance/seedance-2.0/requests/{id}/status)
    // that differs from the full model path we'd construct. Use status_url from submit response for
    // status polling, but always construct the result URL ourselves (response_url uses shortened path
    // that fal.ai rejects with 422 on the result endpoint).
    const rewrite = (url) => url ? url.replace('https://queue.fal.run', QUEUE_BASE) : undefined;
    const statusUrl = rewrite(submitData.status_url);
    const result = await pollForResult(falModelId, requestId, apiKey, maxAttempts, 2000, statusUrl, undefined);
    return normalizeOutput(result);
}

function requireFalModel(modelId) {
    const falId = getFalModelId(modelId);
    if (!falId) throw new Error(`Model "${modelId}" is not available on fal.ai. See docs/fal-ai-migration.md for details.`);
    return falId;
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function generateImage(apiKey, params) {
    const falId = requireFalModel(params.model);
    const payload = { prompt: params.prompt };
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (params.image_url) { payload.image_url = params.image_url; payload.strength = params.strength || 0.6; }
    else if (params.images_list) { payload.images_list = params.images_list; }
    if (params.seed && params.seed !== -1) payload.seed = params.seed;
    if (params.width) payload.image_size = { width: params.width, height: params.height || params.width };
    else if (params.height) payload.image_size = { width: params.width || params.height, height: params.height };
    if (params.num_images && params.num_images > 1) payload.num_images = params.num_images;
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 60);
}

export async function generateI2I(apiKey, params) {
    const modelInfo = getI2IModelById(params.model);
    const falId = requireFalModel(params.model);
    const payload = {};
    if (params.prompt) payload.prompt = params.prompt;
    const imageField = modelInfo?.imageField || 'image_url';
    const imagesList = params.images_list?.length > 0 ? params.images_list : (params.image_url ? [params.image_url] : null);
    if (imagesList) {
        if (imageField === 'images_list') payload.images_list = imagesList;
        else payload[imageField] = imagesList[0];
    }
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (modelInfo?.inputs?.name) payload.name = params.name || modelInfo.inputs.name.default;
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 60);
}

export async function generateVideo(apiKey, params) {
    const falId = requireFalModel(params.model);
    const payload = {};
    if (params.prompt) payload.prompt = params.prompt;
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.duration) payload.duration = params.duration;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (params.mode) payload.mode = params.mode;
    if (params.image_url) payload.image_url = params.image_url;
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 900);
}

export async function generateI2V(apiKey, params) {
    const modelInfo = getI2VModelById(params.model);
    const falId = requireFalModel(params.model);
    const payload = {};
    if (params.prompt) payload.prompt = params.prompt;
    const imageField = modelInfo?.imageField || 'image_url';
    if (params.images_list?.length > 0) {
        if (imageField === 'images_list') payload.images_list = params.images_list;
        else payload[imageField] = params.images_list[0];
    } else if (params.image_url) {
        if (imageField === 'images_list') payload.images_list = [params.image_url];
        else payload[imageField] = params.image_url;
    }
    const lastImageField = modelInfo?.lastImageField;
    if (lastImageField && params.last_image) {
        if (lastImageField === 'images_list') {
            if (!payload.images_list) payload.images_list = [];
            if (!payload.images_list.includes(params.last_image)) payload.images_list.push(params.last_image);
        } else {
            payload[lastImageField] = params.last_image;
        }
    }
    if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
    if (params.duration) payload.duration = params.duration;
    if (params.resolution) payload.resolution = params.resolution;
    if (params.quality) payload.quality = params.quality;
    if (params.mode) payload.mode = params.mode;
    if (modelInfo?.inputs?.name) payload.name = params.name || modelInfo.inputs.name.default;
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 900);
}

export async function processV2V(apiKey, params) {
    const modelInfo = getV2VModelById(params.model);
    const falId = requireFalModel(params.model);
    const videoField = modelInfo?.videoField || 'video_url';
    const payload = { [videoField]: params.video_url };
    if (modelInfo?.imageField && params.image_url) payload[modelInfo.imageField] = params.image_url;
    if (modelInfo?.hasPrompt && params.prompt) payload.prompt = params.prompt;
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 900);
}

export async function processLipSync(apiKey, params) {
    const modelInfo = getLipSyncModelById(params.model);
    const falId = requireFalModel(params.model);
    const payload = {};
    if (params.audio_url) payload.audio_url = params.audio_url;
    if (params.image_url) payload.image_url = params.image_url;
    if (params.video_url) payload.video_url = params.video_url;
    if (modelInfo?.hasPrompt) payload.prompt = params.prompt || '';
    if (params.resolution) payload.resolution = params.resolution;
    if (params.seed !== undefined && params.seed !== -1) payload.seed = params.seed;
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 900);
}

export async function generateAudio(apiKey, params) {
    const modelId = params._modelId || params.model;
    const falId = requireFalModel(modelId);
    const payload = {};
    const skipKeys = ['_modelId', 'onRequestId'];
    for (const key in params) {
        if (!skipKeys.includes(key) && params[key] !== undefined && params[key] !== null) {
            payload[key] = params[key];
        }
    }
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 900);
}

export async function generateMarketingStudioAd(apiKey, params) {
    // Closest fal.ai equivalent for Seedance VIP omni — use Seedance Pro T2V
    const falId = 'fal-ai/bytedance/seedance/v1/pro/text-to-video';
    const payload = {
        prompt: params.prompt,
        aspect_ratio: params.aspect_ratio || '16:9',
        duration: String(params.duration || 5),
    };
    if (params.resolution) payload.resolution = params.resolution;
    return submitAndPoll(falId, payload, apiKey, params.onRequestId, 900);
}

export async function runClipping(apiKey, params) {
    throw new Error('AI Clipping is a MuAPI-specific feature and is not available on fal.ai. See docs/fal-ai-migration.md.');
}

export async function runMotionGraphics(apiKey, params) {
    throw new Error('Motion Graphics is a MuAPI-specific feature and is not available on fal.ai. See docs/fal-ai-migration.md.');
}

export async function runMotionGraphicsEdit(apiKey, params) {
    throw new Error('Motion Graphics is a MuAPI-specific feature and is not available on fal.ai. See docs/fal-ai-migration.md.');
}

// ── File Upload ───────────────────────────────────────────────────────────────

export function uploadFile(apiKey, file, onProgress) {
    return new Promise(async (resolve, reject) => {
        try {
            // Step 1: Initiate upload — get presigned URL from fal.ai storage
            const initiateRes = await fetch(`${STORAGE_BASE}/storage/upload/initiate`, {
                method: 'POST',
                headers: falHeaders(apiKey),
                body: JSON.stringify({
                    content_type: file.type || 'application/octet-stream',
                    file_name: file.name || 'upload',
                }),
            });
            if (!initiateRes.ok) {
                const errText = await initiateRes.text();
                notifyAuthRequired(initiateRes.status, errText);
                reject(new Error(`Upload initiate failed: ${initiateRes.status} - ${errText.slice(0, 100)}`));
                return;
            }
            const { upload_url, file_url } = await initiateRes.json();

            // Step 2: PUT the file to the presigned S3/GCS URL
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', upload_url);
            xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');

            if (onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        onProgress(Math.round((event.loaded / event.total) * 100));
                    }
                };
            }

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve(file_url);
                } else {
                    reject(new Error(`File upload failed: ${xhr.status} - ${xhr.statusText}`));
                }
            };
            xhr.onerror = () => reject(new Error('Network error during file upload'));
            xhr.send(file);

        } catch (error) {
            reject(error);
        }
    });
}

// ── Account / Balance ─────────────────────────────────────────────────────────

export async function getUserBalance(apiKey) {
    const isBrowser = typeof window !== 'undefined' && window.location?.protocol?.startsWith('http');
    const base = isBrowser ? '/api/fal-platform' : 'https://api.fal.ai';
    const res = await fetch(`${base}/v1/account/billing?expand=credits`, {
        headers: {
            'Authorization': `Key ${apiKey}`,
            'x-api-key': apiKey, // needed for the Next.js proxy to forward auth
        },
    });
    if (!res.ok) {
        return { balance: null, currency: 'USD', adminRequired: res.status === 403 || res.status === 401 };
    }
    const data = await res.json();
    const credits = data.credits ?? data;
    return {
        balance: credits.current_balance ?? credits.balance ?? 0,
        currency: credits.currency ?? 'USD',
    };
}

// ── MuAPI Workflow / Agent stubs ──────────────────────────────────────────────
// Workflows and Agents are MuAPI-specific backend features with no fal.ai equivalent.

const EMPTY_LIST = async () => [];
const NOT_AVAILABLE = () => { throw new Error('Workflows and Agents are MuAPI-specific features not available on fal.ai.'); };

export const getTemplateWorkflows = EMPTY_LIST;
export const getUserWorkflows = EMPTY_LIST;
export const getPublishedWorkflows = EMPTY_LIST;
export const getTemplateAgents = EMPTY_LIST;
export const getUserAgents = EMPTY_LIST;
export const getPublishedAgents = EMPTY_LIST;
export const getUserConversations = EMPTY_LIST;
export const getAllNodeSchemas = EMPTY_LIST;
export const getNodeSchemas = EMPTY_LIST;
export const createWorkflow = NOT_AVAILABLE;
export const updateWorkflowName = NOT_AVAILABLE;
export const deleteWorkflow = NOT_AVAILABLE;
export const getWorkflowInputs = NOT_AVAILABLE;
export const executeWorkflow = NOT_AVAILABLE;
export const getWorkflowData = NOT_AVAILABLE;
export const runSingleNode = NOT_AVAILABLE;
export const deleteNodeRun = NOT_AVAILABLE;
export const getNodeStatus = NOT_AVAILABLE;

export async function calculateDynamicCost(apiKey, taskName, payload) {
    throw new Error('calculateDynamicCost is a MuAPI-specific feature not available on fal.ai.');
}

export async function registerAppInterest(apiKey, appName) {
    return {}; // No-op on fal.ai
}

export async function getAppInterests(apiKey) {
    return []; // No app interests on fal.ai
}

// ── Server-side proxy helpers (Next.js API routes) ────────────────────────────
// The new fal.ai proxy routes (/api/fal, /api/fal-storage) handle proxying
// directly. These stubs maintain backward export compatibility.

export async function handleProxyRequest(prefix, path, method, headers, body, apiKey) {
    throw new Error('handleProxyRequest: use the /api/fal Next.js route instead.');
}

export async function handleServerSideProxy(prefix, request, params, apiKey) {
    throw new Error('handleServerSideProxy: use the /api/fal Next.js route instead.');
}
