# Chrono Banana Factory 🍌⏰

**Time-Series Image Generation Tool** - Nano Banana Hackathon 2025 Project

## Overview

Chrono Banana Factory is an innovative tool that generates a series of images representing the passage of time. Leveraging the nanobanana API (Google Gemini 2.5 Flash Image Preview API), it enables easy creation of sequential images for storytelling and video production.
- Youtube Demo: https://youtu.be/J9vOnQtag1Q

## Use Cases

- **Create storyboard illustrations** for narratives like "A bank robber appears! After an intense car chase, they're finally arrested..."
- **Generate start/end frames for video AI** such as "Start with a wide shot of a speeding motorcycle above the city, then drone shot zooming in on the character"
- **Visualize temporal changes** like "A girl eating 3 hours later", "Tourist spots across four seasons", or "What delicious food looked like 2 hours ago"

### Key Features

- **🎬 Time-Series Image Generation**: Generate multiple images showing temporal progression
- **⏱️ Advanced Time Control**: Four modes - Current Only, Scene Start, Scene End, Custom Time Range (Past/Future)
- **📝 Story Enhancement**: AI-powered story generation and improvement (Gemini 2.5 Flash Lite)
- **🎨 Art Style Selection**: 7 styles - Photo, Watercolor, Oil, 3D CG, Anime, Manga, Figure
- **🖼️ Reference Images**: Use up to 15 reference images for guided generation
- **📐 Aspect Ratio Control**: Support for various ratios - square, landscape, portrait, wide
- **♻️ Image Reuse**: Use generated images as input for iterative creation

## Tech Stack

- **Framework**: Next.js 15.5.2 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **AI APIs**: 
  - Gemini 2.5 Flash Image Preview (Image Generation)
  - Gemini 2.5 Flash Lite (Text Generation)
- **Image Processing**: HTML Canvas API

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Google AI Studio API Key

### Installation

1. Clone the repository
```bash
git clone https://github.com/Yumeno/chrono_banana_factory.git
cd chrono_banana_factory
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
Create `.env.local` and add your API key:
```env
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```
Or
```bash
export GEMINI_API_KEY="your_api_key_here"
export NEXT_PUBLIC_GEMINI_API_KEY="your_api_key_here"
```

4. Start the development server
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Basic Workflow

![Image](https://github.com/user-attachments/assets/d9732a3f-4047-4fde-aaaf-380c7fa6918d)

1. **Enter story text**: Input your ideas in the text area
2. **Add reference images**: Upload character or background images if available
3. **Click Enhance**: Generate enhanced prompts based on your ideas and reference images
4. **Set image count**: Choose number of images to generate (1-10)
5. **Configure time control**: Select temporal expression method
6. **Choose art style**: Pick your preferred artistic style
7. **Generate images**: Click "Generate Scenes" button

### Story Enhancement Feature

![Image](https://github.com/user-attachments/assets/84acd6ce-0324-4191-b8de-828bd57b34bf)

AI-powered story generation and improvement:

1. **Story Mode**: Generate narratives with clear scene breaks (for picture books/storyboards)
2. **Video Mode**: Generate scene descriptions including acting and camera work (for video start/end frames)
3. **Moment Mode**: Generate detailed single scene descriptions (general prompt enhancement)

When reference images are provided, AI creatively incorporates image elements (characters, backgrounds, objects) into the narrative.

### Time Control Modes

![Image](https://github.com/user-attachments/assets/ae05d3a1-11b1-4da3-9c21-525c0e0187d9)

#### 1. Standard
- Generates single time point images without temporal elements
- Behaves like standard image generation

#### 2. Scene Start
- Generates starting points of each scene, ideal for story beginnings
- When image count is set, generates specified number of scene start images

#### 3. Scene End
- Generates ending points of each scene, perfect for climaxes and conclusions
- When image count is set, generates specified number of scene end images

#### 4. Custom Future/Past
Specify concrete time ranges to express changes:
- Positive values: Future relative to text description
- Negative values: Past relative to text description
- Time units: seconds, minutes, hours, days, weeks, months, years
- Image count divides the time range for timelapse-like generation
- Example: "1 year in 4 images" → Shows seasonal changes

### Reference Image Usage

![Image](https://github.com/user-attachments/assets/edae245b-1fb9-4fe5-9b0c-0aa78268b3f1)

- **Character images**: Used as story protagonists in enhancement
- **Background images**: Used as scene settings in enhancement
- **Object images**: Appear as props or important items in enhancement
- **Reuse generated images**: "Use as Input" adds generated images as references

![Image](https://github.com/user-attachments/assets/11d12130-2f0a-4d86-84c2-dbce2d2a4065)

- **Limit**: Maximum 15 images

## Project Structure

```
chrono_banana_factory/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Main page
│   │   └── layout.tsx    # Layout
│   ├── components/       # UI Components
│   │   ├── story/        # Story-related
│   │   ├── time/         # Time control
│   │   ├── style/        # Style selection
│   │   └── ui/           # shadcn/ui base components
│   ├── lib/
│   │   ├── api/          # API-related
│   │   │   ├── nanoBananaClient.ts    # Gemini API client
│   │   │   └── suggestionGenerator.ts  # Story generation
│   │   └── utils/        # Utility functions
│   └── types/            # TypeScript definitions
├── public/               # Static files
└── .env.local           # Environment variables (create this)
```

## Main Components

### StoryTextInput
Text input and enhancement functionality

### TimePointControls  
Time control settings (mode, time range, divisions)

### ArtStyleSelector

![Image](https://github.com/user-attachments/assets/7657315b-80b2-4299-88d4-d0dfdfae3ca8)

Collapsible selector for 7 art styles

### ImageUploadArea
Reference image upload with drag & drop support

### GeneratedScenes
Display and download generated images

## (Sample workflow)

### (Operations)

Press "Cherry Blossom" 

![Image](https://github.com/user-attachments/assets/2e3d2b30-ee3a-4155-8c50-e4d34a0dd840)

Select "Moment" and Press "Story Enhance" 

![Image](https://github.com/user-attachments/assets/a0956d8c-6be2-4858-a2cd-58029e281b28)

Select "Art style" as "Watercolor" 

![Image](https://github.com/user-attachments/assets/edf0efaf-cfc9-4977-909e-d3fef80547ce)

Choose "Time control" like this 

![Image](https://github.com/user-attachments/assets/42e2e48f-12fc-471f-ada4-8dbc1698d8b3)

Generate Image 

![Image](https://github.com/user-attachments/assets/a09f3234-9c72-45a4-9dba-b48225a0c019)

If you cannot get images, try this prompt 

![Image](https://github.com/user-attachments/assets/d70dc6ef-1074-4de2-a7df-13be82645a00)

After retry several times... like this 

![Image](https://github.com/user-attachments/assets/d3d5aed3-1657-4fc3-b613-ea8cb1a336dc)

### (Results)

![Image](https://github.com/user-attachments/assets/dc2de7b9-9713-40c8-bdeb-9cc5d1e40105)

![Image](https://github.com/user-attachments/assets/b3c081a4-a3cc-4606-9a90-248998a604f1)

![Image](https://github.com/user-attachments/assets/9306294b-9bc6-4a09-b12d-e2cb53833ca7)

![Image](https://github.com/user-attachments/assets/7b1bd593-2429-49c2-8163-9aa37709d6d0)


## Troubleshooting

### API Key Errors
- Get your key from Google AI Studio: https://aistudio.google.com/apikey
- Ensure proper configuration in `.env.local`

### Image Generation Errors
- Verify prompts are specific and detailed
- Check reference image formats (PNG, JPEG, WebP supported)
- Confirm daily API limits haven't been reached

### Time Control or Image Count Issues
- Model responses can be unstable; try multiple attempts
- The system relies on the AI model's interpretation

## Developer Information

### Build
```bash
npm run build
```

### Type Check
```bash
npm run type-check
```

### Lint
```bash
npm run lint
```

## API Limitations

- **Free tier**: 100 requests per day (during hackathon)
- **Image size**: Automatically adjusted
- **Reference images**: Maximum 15 (experimentally confirmed)

## License

MIT License

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss proposed changes.

## Acknowledgments

- Google DeepMind - Nano Banana Hackathon organizer
- Gemini API - Powerful image and text generation capabilities
- Next.js & Vercel - Excellent development experience and hosting
- shadcn/ui - Beautiful UI components

## Contact

- GitHub: [@Yumeno](https://github.com/Yumeno)
- Project: [Chrono Banana Factory](https://github.com/Yumeno/chrono_banana_factory)

---

🍌 **Nano Banana Hackathon 2025** - Unleash creativity across time!
