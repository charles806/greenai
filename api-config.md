# API Configuration

## Google Gemini API Key

To change the API key, edit the file: `src/config/apiConfig.ts`

Current configuration:
- **API Key**: AIzaSyCf_gnLVdSKwHnlM74oRJ-QW_W8fEW8xzg
- **Model**: gemini-1.5-flash

## How to Update API Key

1. Open `src/config/apiConfig.ts`
2. Replace the `GEMINI_API_KEY` value with your new key
3. Save the file
4. The application will automatically use the new key

## API Key Format
```javascript
export const API_CONFIG = {
  GEMINI_API_KEY: 'your-api-key-here',
  GEMINI_MODEL: 'gemini-1.5-flash'
};
```

## Getting a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and update the configuration file