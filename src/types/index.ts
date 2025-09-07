// Start-End Frame Assist App Type Definitions

export type Provider = 'gemini' | 'fal';
export type AIModel = 'gemini-2.5-flash-image-preview' | 'gemini-2.5-flash-lite';

export interface ImageGenerationRequest {
  prompt: string;
  model: AIModel;
  images?: UploadedImage[];
}

export interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  model: AIModel;
  createdAt: Date;
  metadata: {
    mimeType: string;
    processingTime?: number;
    dimensions?: {
      width: number;
      height: number;
    };
    textResponse?: string;
    isTextOnly?: boolean;
  };
}

// Nano Banana API Response Types
export interface NanoBananaResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        inlineData: {
          mimeType: string;
          data: string;
        };
      }>;
    };
  }>;
}

export interface StartFrame {
  id: string;
  imageUrl: string;
  source: 'generated' | 'uploaded';
  prompt?: string;
  refs?: string[];
  createdAt: Date;
}

export interface Narrative {
  text: string;
  analysisJson: {
    setting: string;
    characters: Array<{
      role: string;
      goal?: string;
    }>;
    current_state: string;
    implied_motion: string;
    camera: string;
    mood: string;
    continuity_tags: string[];
  };
}

export interface ElapsedTime {
  final: boolean;
  value?: number;
  unit?: 'sec' | 'min' | 'hr';
}

export interface EditPrompt {
  text: string;
  variants: string[];
}

export interface EndFrame {
  url: string;
  seed?: string;
}

export interface EndFrameSet {
  images: EndFrame[];
  chosenIndex?: number;
}

export interface Session {
  id: string;
  startFrame?: StartFrame;
  narrative?: Narrative;
  elapsedTime: ElapsedTime;
  editPrompt?: EditPrompt;
  endFrameSet?: EndFrameSet;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    provider: Provider;
    request_id?: string;
    elapsed_time?: number;
  };
}

export interface GenerateStartRequest {
  provider?: Provider;
  prompt: string;
  refs?: string[];
  resolution?: '512' | '768' | '1024' | 'custom';
}

export interface GenerateEndRequest {
  provider?: Provider;
  startImageUrl: string;
  editPrompt: string;
  n: 1 | 2 | 3 | 4;
  refs?: string[];
  resolution?: '512' | '768' | '1024' | 'custom';
}

export interface SuggestNarrativeRequest {
  startImageUrl: string;
}

export interface SuggestEditPromptRequest {
  narrative: string;
  elapsed: ElapsedTime;
  styleHints?: string[];
}

export interface AppError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AppConfig {
  defaultResolution: '512' | '768' | '1024';
  maxVariants: 1 | 2 | 3 | 4;
  providers: {
    gemini: {
      enabled: boolean;
      model: string;
    };
    fal: {
      enabled: boolean;
      t2iEndpoint: string;
      editEndpoint: string;
    };
  };
}

// Image Upload Types (Minimal - per Gemini API requirements)
export interface UploadedImage {
  id: string;
  file: File;
  name: string;
  size: number;
  mimeType: string;
  base64: string; // For Gemini API
  previewUrl: string; // Object URL for display
  uploadedAt: Date;
}

export interface ImageEditRequest {
  prompt: string;
  model: AIModel;
  images: Array<{
    data: string; // base64
    mimeType: string;
  }>;
}

// Phase 2.5: Timeline-based multi-modal types
export interface ContentPart {
  type: 'text' | 'image';
  content: string; // text content or image URL
  order: number;
  timestamp: Date;
}

export interface TimelineResponse {
  id: string;
  parts: ContentPart[];
  prompt: string;
  createdAt: Date;
  metadata: {
    model: string;
    processingTime: number;
    totalParts: number;
    textParts: number;
    imageParts: number;
  };
}

export interface StoryGenerationRequest extends ImageGenerationRequest {
  storyLength?: number; // Number of parts/images desired
  enableText?: boolean; // Whether to include text explanations
}