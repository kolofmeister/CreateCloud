import { getModelById, getVideoModelById, getI2IModelById, getI2VModelById, getV2VModelById, getLipSyncModelById } from './models.js';

// Maps MuAPI model IDs to fal.ai model IDs (null = not available on fal.ai).
const FAL_MODEL_MAP = {
    // Text-to-Image
    'flux-dev': 'fal-ai/flux/dev',
    'flux-dev-lora': 'fal-ai/flux-lora',
    'flux-kontext-dev-t2i': 'fal-ai/flux-pro/kontext/text-to-image',
    'flux-kontext-pro-t2i': 'fal-ai/flux-pro/kontext/text-to-image',
    'flux-kontext-max-t2i': 'fal-ai/flux-pro/kontext/max/text-to-image',
    'flux-schnell': 'fal-ai/flux/schnell',
    'flux-pulid': 'fal-ai/flux/pulid',
    'flux-redux': 'fal-ai/flux-pro/redux',
    'flux-krea-dev': 'fal-ai/flux/krea',
    'flux-2-dev': 'fal-ai/flux-2',
    'flux-2-pro': 'fal-ai/flux-2-max',
    'flux-2-flex': 'fal-ai/flux-2-flex',
    'flux-2-klein-4b': 'fal-ai/flux-2/klein/4b',
    'flux-2-klein-9b': 'fal-ai/flux-2/klein/9b',
    'hidream-i1-fast': 'fal-ai/hidream-i1-fast',
    'hidream-i1-dev': 'fal-ai/hidream-i1',
    'hidream-i1-full': 'fal-ai/hidream-i1-full',
    'wan2.1-text-to-image': 'fal-ai/wan/v2.7/text-to-image',
    'wan2.5-text-to-image': 'fal-ai/wan-25-preview/text-to-image',
    'wan2.6-text-to-image': 'wan/v2.6/text-to-image',
    'sdxl-image': 'fal-ai/stable-diffusion-xl',
    'ideogram-v3-t2i': 'fal-ai/ideogram/v3',
    'hunyuan-image-2.1': 'fal-ai/hunyuan-image/v3/text-to-image',
    'hunyuan-image-3.0': 'fal-ai/hunyuan-image/v3/text-to-image',
    'chroma-image': 'fal-ai/chroma',
    'reve-text-to-image': 'fal-ai/recraft/v4/text-to-image',
    'minimax-image-01': 'fal-ai/minimax/image-01',
    'nano-banana': 'fal-ai/nano-banana',
    'nano-banana-pro': 'fal-ai/nano-banana-pro',
    'nano-banana-2': 'fal-ai/nano-banana-2',
    'gpt4o-text-to-image': 'fal-ai/gpt-image-1/text-to-image',
    'gpt-image-1.5': 'fal-ai/gpt-image-1.5',
    'gpt-image-2': 'openai/gpt-image-2',
    'google-imagen4': 'fal-ai/gemini-25-flash-image',
    'google-imagen4-fast': 'fal-ai/gemini-25-flash-image',
    'google-imagen4-ultra': 'fal-ai/gemini-3-pro-image-preview',
    'grok-imagine-text-to-image': 'xai/grok-imagine-image',
    'qwen-image': 'fal-ai/qwen-image',
    'qwen-text-to-image-2512': 'fal-ai/qwen-image-2512',
    'bytedance-seedream-v4': 'fal-ai/bytedance/seedream/v4/text-to-image',
    'bytedance-seedream-v4.5': 'fal-ai/bytedance/seedream/v4.5/text-to-image',
    'seedream-5.0': 'fal-ai/bytedance/seedream/v5/lite/text-to-image',
    'z-image-turbo': 'fal-ai/z-image/turbo',
    'z-image-base': 'fal-ai/z-image/base',
    'ai-anime-generator': null,
    'midjourney-v7-text-to-image': null,
    'kling-o1-text-to-image': null,
    'vidu-q2-text-to-image': null,
    'leonardoai-phoenix-1.0': null,
    'leonardoai-lucid-origin': null,
    'bytedance-seedream-v3': null,
    'perfect-pony-xl': null,
    'neta-lumina': null,
    // Text-to-Video
    'wan2.1-text-to-video': 'fal-ai/wan-t2v',
    'wan2.2-text-to-video': 'fal-ai/wan/v2.2-a14b/text-to-video',
    'wan2.2-5b-fast-t2v': 'fal-ai/wan/v2.2-5b/text-to-video',
    'wan2.5-text-to-video': 'fal-ai/wan-25-preview/text-to-video',
    'wan2.6-text-to-video': 'wan/v2.6/text-to-video',
    'wan2.7-text-to-video': 'fal-ai/wan/v2.7/text-to-video',
    'kling-v2.1-master-t2v': 'fal-ai/kling-video/v2.1/master/text-to-video',
    'kling-v2.5-turbo-pro-t2v': 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
    'kling-v2.6-pro-t2v': 'fal-ai/kling-video/v2.6/pro/text-to-video',
    'kling-v3.0-pro-text-to-video': 'fal-ai/kling-video/v3/pro/text-to-video',
    'kling-v3.0-standard-text-to-video': 'fal-ai/kling-video/v3/standard/text-to-video',
    'kling-o1-text-to-video': 'fal-ai/kling-video/o3/pro/text-to-video',
    'veo3-text-to-video': 'fal-ai/veo3',
    'veo3-fast-text-to-video': 'fal-ai/veo3/fast',
    'veo3.1-text-to-video': 'fal-ai/veo3.1',
    'veo3.1-fast-text-to-video': 'fal-ai/veo3.1/fast',
    'veo3.1-lite-text-to-video': 'fal-ai/veo3.1/lite',
    'sora-2-text-to-video': 'fal-ai/sora-2/text-to-video',
    'sora-2-pro-text-to-video': 'fal-ai/sora-2/text-to-video/pro',
    'grok-imagine-text-to-video': 'xai/grok-imagine-video/text-to-video',
    'hunyuan-text-to-video': 'fal-ai/hunyuan-video',
    'hunyuan-fast-text-to-video': 'fal-ai/hunyuan-video-v1.5/text-to-video',
    'seedance-lite-t2v': 'fal-ai/bytedance/seedance/v1/pro/text-to-video',
    'seedance-pro-t2v': 'fal-ai/bytedance/seedance/v1/pro/text-to-video',
    'seedance-pro-t2v-fast': 'fal-ai/bytedance/seedance/v1/pro/fast/text-to-video',
    'seedance-v1.5-pro-t2v': 'fal-ai/bytedance/seedance/v1.5/pro/text-to-video',
    'seedance-v2.0-t2v': 'bytedance/seedance-2.0/text-to-video',
    'seedance-v2.0-fast-t2v': 'bytedance/seedance-2.0/fast/text-to-video',
    'runway-text-to-video': null,
    'seedance-v2.0-extend': null,
    // Image-to-Video
    'kling-v2.1-master-i2v': 'fal-ai/kling-video/v2.1/master/image-to-video',
    'kling-v2.1-standard-i2v': 'fal-ai/kling-video/v2.1/standard/image-to-video',
    'kling-v2.1-pro-i2v': 'fal-ai/kling-video/v2.1/pro/image-to-video',
    'kling-v2.5-turbo-pro-i2v': 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
    'kling-v2.5-turbo-std-i2v': 'fal-ai/kling-video/v2.5-turbo/standard/image-to-video',
    'kling-v2.6-pro-i2v': 'fal-ai/kling-video/v2.6/pro/image-to-video',
    'kling-v3.0-pro-image-to-video': 'fal-ai/kling-video/v3/pro/image-to-video',
    'kling-v3.0-standard-image-to-video': 'fal-ai/kling-video/v3/standard/image-to-video',
    'kling-v3.0-omni-standard-image-to-video': 'fal-ai/kling-video/v3/standard/image-to-video',
    'kling-v3.0-omni-pro-image-to-video': 'fal-ai/kling-video/v3/pro/image-to-video',
    'kling-v3.0-omni-4k-image-to-video': 'fal-ai/kling-video/v3/4k/image-to-video',
    'kling-o1-image-to-video': 'fal-ai/kling-video/o1/image-to-video',
    'kling-o1-reference-to-video': 'fal-ai/kling-video/o1/reference-to-video',
    'kling-o1-standard-image-to-video': 'fal-ai/kling-video/o1/standard/image-to-video',
    'kling-o1-standard-reference-to-video': 'fal-ai/kling-video/o1/reference-to-video',
    'veo3.1-image-to-video': 'fal-ai/veo3.1/image-to-video',
    'veo3.1-fast-image-to-video': 'fal-ai/veo3.1/fast/image-to-video',
    'veo3.1-lite-image-to-video': 'fal-ai/veo3.1/lite/image-to-video',
    'veo3.1-reference-to-video': 'fal-ai/veo3.1/reference-to-video',
    'openai-sora-2-image-to-video': 'fal-ai/sora-2/image-to-video',
    'openai-sora-2-pro-image-to-video': 'fal-ai/sora-2/image-to-video/pro',
    'grok-imagine-image-to-video': 'xai/grok-imagine-video/image-to-video',
    'pixverse-v4.5-i2v': 'fal-ai/pixverse/v4.5/image-to-video',
    'pixverse-v5-i2v': 'fal-ai/pixverse/v5/image-to-video',
    'pixverse-v5.5-i2v': 'fal-ai/pixverse/v5.5/image-to-video',
    'pixverse-v6-i2v': 'fal-ai/pixverse/v6/image-to-video',
    'vidu-v2.0-i2v': 'fal-ai/vidu/q3/image-to-video',
    'vidu-q1-reference': 'fal-ai/vidu/q3/image-to-video',
    'vidu-q2-reference': 'fal-ai/vidu/q3/image-to-video',
    'vidu-q2-turbo-start-end-video': 'fal-ai/vidu/q3/image-to-video/turbo',
    'vidu-q2-pro-start-end-video': 'fal-ai/vidu/q3/image-to-video',
    'wan2.1-reference-video': 'fal-ai/wan-i2v',
    'wan2.2-image-to-video': 'fal-ai/wan/v2.2-a14b/image-to-video',
    'wan2.5-image-to-video': 'fal-ai/wan-25-preview/image-to-video',
    'wan2.6-image-to-video': 'wan/v2.6/image-to-video',
    'wan2.7-image-to-video': 'fal-ai/wan/v2.7/image-to-video',
    'ltx-2-pro-image-to-video': 'fal-ai/ltx-2/image-to-video',
    'ltx-2-fast-image-to-video': 'fal-ai/ltx-2/image-to-video/fast',
    'ltx-2-19b-image-to-video': 'fal-ai/ltx-2-19b/image-to-video',
    'minimax-hailuo-02-standard-i2v': 'fal-ai/minimax/hailuo-02/standard/image-to-video',
    'minimax-hailuo-02-pro-i2v': 'fal-ai/minimax/hailuo-02/pro/image-to-video',
    'minimax-hailuo-2.3-pro-i2v': 'fal-ai/minimax/hailuo-2.3/pro/image-to-video',
    'minimax-hailuo-2.3-standard-i2v': 'fal-ai/minimax/hailuo-2.3/standard/image-to-video',
    'minimax-hailuo-2.3-fast': 'fal-ai/minimax/hailuo-2.3-fast/standard/image-to-video',
    'seedance-lite-i2v': 'fal-ai/bytedance/seedance/v1/pro/image-to-video',
    'seedance-pro-i2v': 'fal-ai/bytedance/seedance/v1/pro/image-to-video',
    'seedance-pro-i2v-fast': 'fal-ai/bytedance/seedance/v1/pro/fast/image-to-video',
    'seedance-v1.5-pro-i2v': 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
    'seedance-v2.0-i2v': 'bytedance/seedance-2.0/image-to-video',
    'seedance-v2.0-fast-i2v': 'bytedance/seedance-2.0/fast/image-to-video',
    'seedance-lite-reference-video': 'fal-ai/bytedance/seedance/v1.5/pro/image-to-video',
    'runway-act-two-i2v': null,
    'ovi-image-to-video': null,
    'leonardoai-motion-2.0': null,
    'wan2.2-spicy-image-to-video': null,
    // LipSync
    'infinitetalk-image-to-video': 'fal-ai/infinitalk',
    'ltx-2.3-lipsync': 'fal-ai/sync-lipsync/v3',
    'ltx-2-19b-lipsync': 'fal-ai/sync-lipsync/v3',
    'sync-lipsync': 'fal-ai/sync-lipsync/v3',
    'sync-lipsync-v2': 'fal-ai/sync-lipsync/v2',
    'latent-sync': 'fal-ai/latentsync',
    'veed-lipsync': 'veed/lipsync',
    'creatify-lipsync': null,
    'infinitetalk-video-to-video': null,
    'wan2.2-speech-to-video': null,
    // Audio / Speech
    'mmaudio-v2-text-to-audio': 'fal-ai/mmaudio-v2',
    'lyria2-music': 'fal-ai/lyria2',
    'minimax-voice-clone': 'fal-ai/minimax/voice-clone',
    'minimax-speech-2.6-hd': 'fal-ai/minimax/speech-2.6-hd',
    'minimax-speech-2.6-turbo': 'fal-ai/minimax/speech-2.6-turbo',
    'minimax-speech-2.8-hd': 'fal-ai/minimax/speech-2.8-hd',
    'suno-create-music': null,
    'suno-remix-music': null,
    'suno-extend-music': null,
    'suno-generate-sounds': null,
    'suno-add-vocals': null,
    'suno-generate-mashup': null,
    'suno-add-instrumental': null,
    'suno-voice-clone': null,
};

const FAL_QUEUE_BASE = 'https://queue.fal.run';
const FAL_STORAGE_BASE = 'https://rest.alpha.fal.ai';

export class MuapiClient {
    constructor() {
        // fal.ai queue base URL
        this.baseUrl = FAL_QUEUE_BASE;
    }

    getKey() {
        const key = window.__FALAI_KEY__ || window.__MUAPI_KEY__ || localStorage.getItem('falai_key') || localStorage.getItem('muapi_key');
        if (!key) throw new Error('API Key missing. Please set it in Settings.');
        return key;
    }

    getFalModelId(modelId) {
        return FAL_MODEL_MAP[modelId] || null;
    }

    isFalAvailable(modelId) {
        if (!(modelId in FAL_MODEL_MAP)) return true;
        return FAL_MODEL_MAP[modelId] !== null;
    }

    requireFalModel(modelId) {
        const falId = this.getFalModelId(modelId);
        if (!falId) throw new Error(`Model "${modelId}" is not available on fal.ai. See docs/fal-ai-migration.md.`);
        return falId;
    }

    falHeaders(key) {
        return {
            'Content-Type': 'application/json',
            'Authorization': `Key ${key}`,
        };
    }

    normalizeOutput(result) {
        const url = result.images?.[0]?.url
            || result.image?.url
            || result.video?.url
            || result.videos?.[0]?.url
            || result.audio?.url
            || result.audio_url
            || result.url;
        return { ...result, url };
    }

    async pollForResult(falModelId, requestId, key, maxAttempts = 900, interval = 2000) {
        const statusUrl = `${FAL_QUEUE_BASE}/${falModelId}/requests/${requestId}/status`;
        const resultUrl = `${FAL_QUEUE_BASE}/${falModelId}/requests/${requestId}`;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            await new Promise(resolve => setTimeout(resolve, interval));
            try {
                const res = await fetch(statusUrl, { headers: this.falHeaders(key) });
                if (!res.ok) {
                    const errText = await res.text();
                    if (res.status >= 500) continue;
                    throw new Error(`Poll Failed: ${res.status} - ${errText.slice(0, 100)}`);
                }
                const data = await res.json();
                const status = data.status?.toUpperCase();
                if (status === 'COMPLETED') {
                    const resultRes = await fetch(resultUrl, { headers: this.falHeaders(key) });
                    if (!resultRes.ok) throw new Error(`Result fetch failed: ${resultRes.status}`);
                    return await resultRes.json();
                }
                if (status === 'FAILED') throw new Error(`Generation failed: ${data.error || 'Unknown error'}`);
            } catch (error) {
                if (attempt === maxAttempts) throw error;
            }
        }
        throw new Error('Generation timed out after polling.');
    }

    async submitAndPoll(falModelId, payload, key, onRequestId, maxAttempts = 60) {
        const submitUrl = `${FAL_QUEUE_BASE}/${falModelId}`;
        const res = await fetch(submitUrl, {
            method: 'POST',
            headers: this.falHeaders(key),
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`API Request Failed: ${res.status} ${res.statusText} - ${errText.slice(0, 100)}`);
        }
        const submitData = await res.json();
        const requestId = submitData.request_id;
        if (!requestId) return this.normalizeOutput(submitData);
        if (onRequestId) onRequestId(requestId);
        const result = await this.pollForResult(falModelId, requestId, key, maxAttempts);
        return this.normalizeOutput(result);
    }

    async generateImage(params) {
        const key = this.getKey();
        const falId = this.requireFalModel(params.model);
        const payload = { prompt: params.prompt };
        if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
        if (params.resolution) payload.resolution = params.resolution;
        if (params.quality) payload.quality = params.quality;
        if (params.image_url) { payload.image_url = params.image_url; payload.strength = params.strength || 0.6; }
        else if (params.images_list) payload.images_list = params.images_list;
        if (params.seed && params.seed !== -1) payload.seed = params.seed;
        if (params.width) payload.image_size = { width: params.width, height: params.height || params.width };
        if (params.num_images && params.num_images > 1) payload.num_images = params.num_images;
        return this.submitAndPoll(falId, payload, key, params.onRequestId, 60);
    }

    async generateVideo(params) {
        const key = this.getKey();
        const falId = this.requireFalModel(params.model);
        const payload = {};
        if (params.prompt) payload.prompt = params.prompt;
        if (params.aspect_ratio) payload.aspect_ratio = params.aspect_ratio;
        if (params.duration) payload.duration = params.duration;
        if (params.resolution) payload.resolution = params.resolution;
        if (params.quality) payload.quality = params.quality;
        if (params.mode) payload.mode = params.mode;
        if (params.image_url) payload.image_url = params.image_url;
        return this.submitAndPoll(falId, payload, key, params.onRequestId, 900);
    }

    async generateI2I(params) {
        const key = this.getKey();
        const modelInfo = getI2IModelById(params.model);
        const falId = this.requireFalModel(params.model);
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
        return this.submitAndPoll(falId, payload, key, params.onRequestId, 60);
    }

    async generateI2V(params) {
        const key = this.getKey();
        const modelInfo = getI2VModelById(params.model);
        const falId = this.requireFalModel(params.model);
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
        return this.submitAndPoll(falId, payload, key, params.onRequestId, 900);
    }

    async processV2V(params) {
        const key = this.getKey();
        const modelInfo = getV2VModelById(params.model);
        const falId = this.requireFalModel(params.model);
        const videoField = modelInfo?.videoField || 'video_url';
        const payload = { [videoField]: params.video_url };
        if (modelInfo?.imageField && params.image_url) payload[modelInfo.imageField] = params.image_url;
        if (modelInfo?.hasPrompt && params.prompt) payload.prompt = params.prompt;
        return this.submitAndPoll(falId, payload, key, params.onRequestId, 900);
    }

    async processLipSync(params) {
        const key = this.getKey();
        const modelInfo = getLipSyncModelById(params.model);
        const falId = this.requireFalModel(params.model);
        const payload = {};
        if (params.audio_url) payload.audio_url = params.audio_url;
        if (params.image_url) payload.image_url = params.image_url;
        if (params.video_url) payload.video_url = params.video_url;
        if (modelInfo?.hasPrompt) payload.prompt = params.prompt || '';
        if (params.resolution) payload.resolution = params.resolution;
        if (params.seed !== undefined && params.seed !== -1) payload.seed = params.seed;
        return this.submitAndPoll(falId, payload, key, params.onRequestId, 900);
    }

    async uploadFile(file) {
        const key = this.getKey();
        const initiateRes = await fetch(`${FAL_STORAGE_BASE}/storage/upload/initiate`, {
            method: 'POST',
            headers: this.falHeaders(key),
            body: JSON.stringify({
                content_type: file.type || 'application/octet-stream',
                file_name: file.name || 'upload',
            }),
        });
        if (!initiateRes.ok) {
            const errText = await initiateRes.text();
            throw new Error(`Upload initiate failed: ${initiateRes.status} - ${errText.slice(0, 100)}`);
        }
        const { upload_url, file_url } = await initiateRes.json();
        const putRes = await fetch(upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
            body: file,
        });
        if (!putRes.ok) throw new Error(`File upload failed: ${putRes.status}`);
        return file_url;
    }
}

export async function getUserBalance() {
    const client = new MuapiClient();
    const key = client.getKey();
    const res = await fetch('https://api.fal.ai/v1/account/billing?expand=credits', {
        headers: { 'Authorization': `Key ${key}` },
    });
    if (!res.ok) {
        if (res.status === 403 || res.status === 401) {
            return { balance: null, currency: 'USD', adminRequired: true };
        }
        const text = await res.text();
        throw new Error(`Balance fetch failed: ${res.status} - ${text.slice(0, 100)}`);
    }
    const data = await res.json();
    const credits = data.credits ?? data;
    return {
        balance: credits.current_balance ?? credits.balance ?? 0,
        currency: credits.currency ?? 'USD',
    };
}

export const muapi = new MuapiClient();
