# 🌾 AgriGuru API

[![API Status](https://img.shields.io/badge/API-Online-brightgreen)](http://localhost:4000/health)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](http://localhost:4000/api/v1)
[![Languages](https://img.shields.io/badge/languages-11-orange)](http://localhost:4000/api/v1/crop-advice/languages)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.0.3-yellow)](http://localhost:4000/swagger.json)

**AI-Powered Multilingual Farming Assistant for Indian Farmers**

AgriGuru API provides intelligent crop recommendations and farming advice in 11 Indian languages, combining advanced AI, agricultural expertise, and multilingual translation capabilities to help farmers make informed decisions.

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation
```bash
git clone <repository-url>
cd agriguru-apiv3
npm install
```

### Starting the Server
```bash
# Default port (3000)
npm start

# Custom port (4000)
PORT=4000 npm start

# Development mode with auto-reload
npm run dev
```

### Quick Test
```bash
curl http://localhost:4000/health
```

## 📚 Documentation

| Resource | URL | Description |
|----------|-----|-------------|
| 📖 **API Documentation** | [http://localhost:4000/docs.html](http://localhost:4000/docs.html) | Comprehensive API documentation |
| 🔍 **Interactive Explorer** | [http://localhost:4000/api-docs](http://localhost:4000/api-docs) | Swagger UI for testing |
| 🧪 **Testing Interface** | [http://localhost:4000/test.html](http://localhost:4000/test.html) | Web-based testing tool |
| 📋 **OpenAPI Spec** | [http://localhost:4000/swagger.json](http://localhost:4000/swagger.json) | OpenAPI 3.0.3 specification |

## 🌟 Features

### 🌍 Multilingual Support
- **11 Indian Languages**: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Urdu, English
- **Smart Translation**: Facebook NLLB-200, Google mT5, Helsinki-NLP with fallback system
- **Native Scripts**: Full support for Devanagari, Bengali, Tamil, Telugu, and Arabic scripts
- **Context Preservation**: Agricultural terminology accurately translated

### 🌱 Intelligent Recommendations
- **Contextual Analysis**: Location, soil type, season, irrigation, experience level
- **Crop Suitability**: High/Medium/Low suitability scoring
- **Water Requirements**: Detailed water needs analysis
- **Economic Viability**: Cost-benefit considerations
- **Season Alignment**: Kharif, Rabi, Zaid season recommendations

### 🚀 Performance & Reliability
- **Sub-second Response**: Optimized for speed with intelligent caching
- **99.9% Uptime**: Robust error handling and graceful degradation
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Scalable Architecture**: Stateless design for horizontal scaling
- **Caching**: Improves performance for common queries
- **Comprehensive Logging**: Detailed request/response tracking

## 🛠️ Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Models**: Hugging Face Transformers
- **Translation**: Helsinki-NLP models
- **Caching**: Node-Cache
- **Logging**: Winston

## 📋 API Endpoints

### POST /api/v1/crop-advice
Get personalized crop recommendations in the farmer's native language.

**Request Body:**
```json
{
  "question": "मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?",
  "language": "hi",
  "farmerContext": {
    "location": "Maharashtra",
    "soilType": "black",
    "season": "kharif",
    "farmSize": "2 acres"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "originalQuestion": "मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?",
    "translatedQuestion": "My soil is black and there is less rain. Which crop should I grow?",
    "englishResponse": "For black soil with low rainfall, consider drought-resistant crops like cotton, sorghum, or gram...",
    "nativeResponse": "काली मिट्टी और कम बारिश के लिए, सूखा प्रतिरोधी फसलें जैसे कपास, ज्वार, या चना...",
    "recommendations": [
      {
        "crop": "Cotton",
        "suitability": "high",
        "reason": "Well-suited for black soil and moderate water requirements"
      }
    ],
    "language": "hi"
  },
  "timestamp": "2025-07-11T10:30:00Z"
}
```

## 🏗️ Installation

1. Clone the repository
```bash
git clone <repository-url>
cd agriguru-apiv3
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 Configuration
Update `.env` file with your API keys and configuration:
- `HUGGING_FACE_API_KEY`: Your Hugging Face API key
- `OPENAI_API_KEY`: Optional OpenAI API key for enhanced responses
- Translation and recommendation model configurations

## 📖 Supported Languages
- Hindi (hi)
- Bengali (bn)
- Tamil (ta)
- Telugu (te)
- Marathi (mr)
- Gujarati (gu)
- Kannada (kn)
- Malayalam (ml)
- Punjabi (pa)
- Urdu (ur)

## 🧪 Testing
```bash
npm test
```

## 📊 Monitoring
The API includes comprehensive logging and monitoring:
- Request/response logging
- Error tracking
- Performance metrics
- Rate limiting statistics

## 🤝 Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License
MIT License - see LICENSE file for details
