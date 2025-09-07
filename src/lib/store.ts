import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { 
  Session, 
  StartFrame, 
  Narrative, 
  ElapsedTime, 
  EditPrompt, 
  EndFrameSet,
  Provider,
  AppError,
  GeneratedImage,
  UploadedImage,
  TimelineResponse
} from '@/types';
import type { AspectRatio } from '@/lib/utils/aspectRatioUtils';

interface AppState {
  // Current session data
  session: Session;
  
  // Phase 1: Image Generation
  images: GeneratedImage[];
  currentImage: GeneratedImage | null;
  
  // Phase 2: Image Upload
  uploadedImages: UploadedImage[];
  selectedUploadedImage: UploadedImage | null;
  
  // Phase 2.5: Timeline (Experimental)
  timelineResponses: TimelineResponse[];
  currentTimeline: TimelineResponse | null;
  isTimelineMode: boolean;
  
  // Phase 2.7: Aspect Ratio Control
  selectedAspectRatio: AspectRatio;
  
  // UI state
  isLoading: boolean;
  currentStep: 'start' | 'suggest' | 'generate';
  error: AppError | null;
  
  // Provider settings
  selectedProvider: Provider;
  availableProviders: Provider[];
  currentProvider: {
    name: string;
    model: string;
    isReady: boolean;
  };
  
  // Actions
  setStartFrame: (frame: StartFrame) => void;
  setNarrative: (narrative: Narrative) => void;
  setElapsedTime: (elapsed: ElapsedTime) => void;
  setEditPrompt: (prompt: EditPrompt) => void;
  setEndFrameSet: (frameSet: EndFrameSet) => void;
  
  // Phase 1: Image Actions
  addImage: (image: GeneratedImage) => void;
  removeImage: (imageId: string) => void;
  setCurrentImage: (image: GeneratedImage | null) => void;
  
  // Phase 2: Upload Actions
  addUploadedImages: (images: UploadedImage[]) => void;
  removeUploadedImage: (imageId: string) => void;
  setSelectedUploadedImage: (image: UploadedImage | null) => void;
  clearUploadedImages: () => void;
  
  // Phase 2.5: Timeline Actions
  addTimelineResponse: (timeline: TimelineResponse) => void;
  setCurrentTimeline: (timeline: TimelineResponse | null) => void;
  setTimelineMode: (enabled: boolean) => void;
  clearTimelines: () => void;
  
  // Aspect Ratio actions
  setSelectedAspectRatio: (ratio: AspectRatio) => void;
  
  // UI actions
  setLoading: (loading: boolean) => void;
  setCurrentStep: (step: 'start' | 'suggest' | 'generate') => void;
  setError: (error: AppError | null) => void;
  
  // Provider actions
  setSelectedProvider: (provider: Provider) => void;
  setAvailableProviders: (providers: Provider[]) => void;
  
  // Session management
  createNewSession: () => void;
  clearSession: () => void;
  resetSuggest: () => void;
}

// Create initial session
const createInitialSession = (): Session => ({
  id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  elapsedTime: { final: true },
  createdAt: new Date(),
  updatedAt: new Date(),
});

// Initialize available providers based on environment variables
const getAvailableProviders = (): Provider[] => {
  const providers: Provider[] = [];
  
  if (typeof window !== 'undefined') {
    if (process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
      providers.push('gemini');
    }
    if (process.env.NEXT_PUBLIC_FAL_KEY) {
      providers.push('fal');
    }
  }
  
  return providers.length > 0 ? providers : ['gemini']; // Default to gemini
};

const getDefaultProvider = (availableProviders: Provider[]): Provider => {
  return availableProviders.includes('gemini') ? 'gemini' : availableProviders[0];
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => {
        const availableProviders = getAvailableProviders();
        
        return {
          // Initial state
          session: createInitialSession(),
          images: [],
          currentImage: null,
          uploadedImages: [],
          selectedUploadedImage: null,
          timelineResponses: [],
          currentTimeline: null,
          isTimelineMode: false,
          selectedAspectRatio: 'auto',
          isLoading: false,
          currentStep: 'start',
          error: null,
          selectedProvider: getDefaultProvider(availableProviders),
          availableProviders,
          currentProvider: {
            name: 'Nano Banana',
            model: 'gemini-2.5-flash-image-preview',
            isReady: true,
          },
          
          // Session actions
          setStartFrame: (frame) => set(
            (state) => ({
              session: {
                ...state.session,
                startFrame: frame,
                updatedAt: new Date(),
              },
              currentStep: 'suggest',
              error: null,
            }),
            false,
            'setStartFrame'
          ),
          
          setNarrative: (narrative) => set(
            (state) => ({
              session: {
                ...state.session,
                narrative,
                updatedAt: new Date(),
              },
            }),
            false,
            'setNarrative'
          ),
          
          setElapsedTime: (elapsed) => set(
            (state) => ({
              session: {
                ...state.session,
                elapsedTime: elapsed,
                updatedAt: new Date(),
              },
            }),
            false,
            'setElapsedTime'
          ),
          
          setEditPrompt: (prompt) => set(
            (state) => ({
              session: {
                ...state.session,
                editPrompt: prompt,
                updatedAt: new Date(),
              },
              currentStep: 'generate',
            }),
            false,
            'setEditPrompt'
          ),
          
          setEndFrameSet: (frameSet) => set(
            (state) => ({
              session: {
                ...state.session,
                endFrameSet: frameSet,
                updatedAt: new Date(),
              },
            }),
            false,
            'setEndFrameSet'
          ),
          
          // Phase 1: Image Actions
          addImage: (image) => set(
            (state) => ({
              images: [image, ...state.images].slice(0, 50), // Keep latest 50 images
            }),
            false,
            'addImage'
          ),
          
          removeImage: (imageId) => set(
            (state) => ({
              images: state.images.filter(img => img.id !== imageId),
            }),
            false,
            'removeImage'
          ),
          
          setCurrentImage: (image) => set(
            { currentImage: image },
            false,
            'setCurrentImage'
          ),
          
          // Phase 2: Upload Actions
          addUploadedImages: (newImages) => set(
            (state) => {
              // Filter out duplicates based on name and size
              const existingImages = state.uploadedImages
              const uniqueNewImages = newImages.filter(newImg => 
                !existingImages.some(existingImg => 
                  existingImg.name === newImg.name && existingImg.size === newImg.size
                )
              )
              
              return {
                uploadedImages: [...existingImages, ...uniqueNewImages].slice(0, 15), // Phase 2.6: Increased to 15 for Gemini API experiment
              }
            },
            false,
            'addUploadedImages'
          ),
          
          removeUploadedImage: (imageId) => set(
            (state) => {
              const imageToRemove = state.uploadedImages.find(img => img.id === imageId);
              if (imageToRemove) {
                // Cleanup object URL
                URL.revokeObjectURL(imageToRemove.previewUrl);
              }
              
              const updatedImages = state.uploadedImages.filter(img => img.id !== imageId);
              const selectedImage = state.selectedUploadedImage?.id === imageId 
                ? null 
                : state.selectedUploadedImage;
                
              return {
                uploadedImages: updatedImages,
                selectedUploadedImage: selectedImage,
              };
            },
            false,
            'removeUploadedImage'
          ),
          
          setSelectedUploadedImage: (image) => set(
            { selectedUploadedImage: image },
            false,
            'setSelectedUploadedImage'
          ),
          
          clearUploadedImages: () => set(
            (state) => {
              // Cleanup all object URLs
              state.uploadedImages.forEach(img => {
                URL.revokeObjectURL(img.previewUrl);
              });
              
              return {
                uploadedImages: [],
                selectedUploadedImage: null,
              };
            },
            false,
            'clearUploadedImages'
          ),

          // Phase 2.5: Timeline Actions
          addTimelineResponse: (timeline) => set(
            (state) => ({
              timelineResponses: [...state.timelineResponses, timeline],
              currentTimeline: timeline,
            }),
            false,
            'addTimelineResponse'
          ),

          setCurrentTimeline: (timeline) => set(
            { currentTimeline: timeline },
            false,
            'setCurrentTimeline'
          ),

          setTimelineMode: (enabled) => set(
            { isTimelineMode: enabled },
            false,
            'setTimelineMode'
          ),

          clearTimelines: () => set(
            {
              timelineResponses: [],
              currentTimeline: null,
            },
            false,
            'clearTimelines'
          ),

          // Aspect Ratio actions  
          setSelectedAspectRatio: (ratio) => set(
            { selectedAspectRatio: ratio },
            false,
            'setSelectedAspectRatio'
          ),
          
          // UI actions
          setLoading: (loading) => set({ isLoading: loading }, false, 'setLoading'),
          
          setCurrentStep: (step) => set({ currentStep: step }, false, 'setCurrentStep'),
          
          setError: (error) => set({ error, isLoading: false }, false, 'setError'),
          
          // Provider actions
          setSelectedProvider: (provider) => set({ selectedProvider: provider }, false, 'setSelectedProvider'),
          
          setAvailableProviders: (providers) => {
            const defaultProvider = getDefaultProvider(providers);
            set({ 
              availableProviders: providers,
              selectedProvider: providers.includes(get().selectedProvider) 
                ? get().selectedProvider 
                : defaultProvider
            }, false, 'setAvailableProviders');
          },
          
          // Session management
          createNewSession: () => set(
            {
              session: createInitialSession(),
              currentStep: 'start',
              isLoading: false,
              error: null,
            },
            false,
            'createNewSession'
          ),
          
          clearSession: () => set(
            (state) => ({
              session: {
                ...createInitialSession(),
                id: state.session.id, // Keep same session ID
              },
              currentStep: 'start',
              isLoading: false,
              error: null,
            }),
            false,
            'clearSession'
          ),
          
          resetSuggest: () => set(
            (state) => ({
              session: {
                ...state.session,
                narrative: undefined,
                editPrompt: undefined,
                endFrameSet: undefined,
                elapsedTime: { final: true },
                updatedAt: new Date(),
              },
              currentStep: 'suggest',
            }),
            false,
            'resetSuggest'
          ),
        };
      },
      {
        name: 'start-end-frame-app-storage',
        partialize: (state) => ({ 
          session: state.session,
          selectedProvider: state.selectedProvider,
        }),
      }
    ),
    {
      name: 'start-end-frame-app-store',
    }
  )
);

// Selector hooks for better performance
export const useSession = () => useAppStore((state) => state.session);
export const useIsLoading = () => useAppStore((state) => state.isLoading);
export const useCurrentStep = () => useAppStore((state) => state.currentStep);
export const useError = () => useAppStore((state) => state.error);
export const useProvider = () => useAppStore((state) => ({
  selected: state.selectedProvider,
  available: state.availableProviders,
}));

// Action hooks
export const useAppActions = () => useAppStore((state) => ({
  setStartFrame: state.setStartFrame,
  setNarrative: state.setNarrative,
  setElapsedTime: state.setElapsedTime,
  setEditPrompt: state.setEditPrompt,
  setEndFrameSet: state.setEndFrameSet,
  setLoading: state.setLoading,
  setCurrentStep: state.setCurrentStep,
  setError: state.setError,
  setSelectedProvider: state.setSelectedProvider,
  setAvailableProviders: state.setAvailableProviders,
  createNewSession: state.createNewSession,
  clearSession: state.clearSession,
  resetSuggest: state.resetSuggest,
}));