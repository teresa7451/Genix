# Firebase Setup for Genix

This guide will help you properly configure Firebase for authentication with X (formerly Twitter).

## Authentication Configuration

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`genix-3ab7d`)
3. Navigate to **Authentication** section
4. Go to the **Sign-in method** tab
5. Enable "X" (formerly Twitter) as a sign-in provider
6. Enter your X Developer credentials:
   - API Key
   - API Secret

## Domain Configuration

You must add your deployment domains to the authorized domains list:

1. In the **Authentication** section, go to the **Settings** tab
2. Under **Authorized domains**, add your domain(s):
   - `genix.cc` (your production domain)
   - `localhost` (for local development)
   - Your Vercel preview domains (if applicable)

## Twitter Developer Account Setup

To enable X (Twitter) authentication, you need to configure your Twitter Developer account:

1. Go to the [X Developer Portal](https://developer.twitter.com/)
2. Navigate to your Project/App settings
3. Under "Authentication settings", add the following callback URLs:
   - `https://<your-firebase-project-id>.firebaseapp.com/__/auth/handler`
   - Your production domain callback URL: `https://genix.cc/__/auth/handler`
   - Include your Vercel preview domain callback URLs as needed

4. Ensure your app has the following permissions:
   - `Tweet read`
   - `Users read`

## Troubleshooting

If you're experiencing authentication issues:

1. Check browser console for specific error messages
2. Ensure your domain is properly added to Firebase authorized domains
3. Verify Twitter Developer app settings have the correct callback URLs
4. Check Firebase configuration in `.env.local` file

## Need Help?

If you're still having issues, please contact the development team or create an issue in the repository.