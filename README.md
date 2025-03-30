# Genix: AI Image Forge
ca:0xb2caa7ee0a2f410b31e8ebffb0b1185b37a33b5f
Genix is a modern AI image generation web application designed with a Web3 dark tech style, featuring user authentication through Firebase and high-quality AI image generation powered by Genix Vision AI.

## Official Links
- Website: [http://genix.cc/](http://genix.cc/)
- X (Twitter): [@Genix_image](https://x.com/Genix_image)

## Features

- **Dark Web3 Style Interface**: Advanced, tech-inspired user interface design
- **User Authentication**: Firebase Authentication with X account login support
- **AI Image Generation**: Integrated Genix Vision AI for high-quality image creation
- **Responsive Design**: Excellent experience on both desktop and mobile devices

## Tech Stack

- **Frontend Framework**: Next.js + React + TypeScript
- **Styling**: TailwindCSS
- **Authentication**: Firebase Authentication
- **AI API**: Genix Vision AI
- **Deployment**: Vercel (recommended)

## Project Structure

```
genix/
├── public/              # Static assets
├── src/                 # Source code
│   ├── app/             # Next.js App Router
│   ├── components/      # Reusable components
│   ├── lib/             # Utility libraries
│   │   ├── firebase.ts  # Firebase configuration
│   │   └── vision.ts    # Vision AI configuration
│   ├── styles/          # Style files
│   └── types/           # TypeScript type definitions
├── .env.local.example   # Environment variables example
└── README.md            # Project documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Firebase account
- Genix Vision AI API key

### Installation Steps

1. Clone the repository and install dependencies

```bash
git clone <repository link>
cd genix
npm install
```

2. Environment Variables Configuration

Copy the `.env.local.example` file and rename it to `.env.local`, then fill in the appropriate API keys:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
AI_API_KEY=your_vision_ai_api_key
AI_BASE_URL=your_vision_ai_base_url 
```

3. Start the development server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

Deployment on Vercel is recommended. Simply connect your GitHub repository and set the appropriate environment variables.

## Future Improvements

- Image history and saving functionality
- Advanced prompt editor
- Community sharing features
- Multiple AI model selection

## Contribution Guidelines

Pull Requests and Issues are welcome. Please make sure to read the contribution guidelines before contributing.

## License

[MIT](LICENSE)
