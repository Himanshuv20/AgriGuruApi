# Example API Requests

## Basic Crop Advice Request (English)

```bash
curl -X POST http://localhost:3000/api/v1/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "question": "I have black soil and limited water supply. Which crop should I grow in the monsoon season?",
    "language": "en",
    "farmerContext": {
      "location": "Maharashtra",
      "soilType": "black",
      "season": "kharif",
      "farmSize": "2 acres",
      "irrigation": "rainfed"
    }
  }'
```

## Multilingual Request (Hindi)

```bash
curl -X POST http://localhost:3000/api/v1/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "question": "मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?",
    "language": "hi",
    "farmerContext": {
      "location": "Madhya Pradesh",
      "soilType": "black",
      "season": "kharif",
      "irrigation": "rainfed",
      "experience": "beginner"
    }
  }'
```

## Bengali Request

```bash
curl -X POST http://localhost:3000/api/v1/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "question": "আমার জমিতে ধান চাষ করতে চাই। কী করতে হবে?",
    "language": "bn",
    "farmerContext": {
      "location": "West Bengal",
      "soilType": "alluvial",
      "season": "kharif",
      "farmSize": "1 acre"
    }
  }'
```

## Tamil Request

```bash
curl -X POST http://localhost:3000/api/v1/crop-advice \
  -H "Content-Type: application/json" \
  -d '{
    "question": "என் நிலத்தில் என்ன பயிர் செய்யலாம்?",
    "language": "ta",
    "farmerContext": {
      "location": "Tamil Nadu",
      "soilType": "red",
      "season": "rabi",
      "irrigation": "irrigated"
    }
  }'
```

## Get Supported Languages

```bash
curl http://localhost:3000/api/v1/crop-advice/languages
```

## Get Soil Types

```bash
curl http://localhost:3000/api/v1/crop-advice/soil-types
```

## Get Cropping Seasons

```bash
curl http://localhost:3000/api/v1/crop-advice/seasons
```

## Health Check

```bash
curl http://localhost:3000/health
```

## API Statistics

```bash
curl http://localhost:3000/api/v1/crop-advice/stats
```

# Example Responses

## Successful Response

```json
{
  "success": true,
  "data": {
    "originalQuestion": "मेरी मिट्टी काली है और बारिश कम होती है। कौन सी फसल उगाऊं?",
    "translatedQuestion": "My soil is black and there is less rain. Which crop should I grow?",
    "englishResponse": "For black soil with low rainfall conditions, I recommend cotton as your primary crop. Black soil is ideal for cotton cultivation as it retains moisture well and provides excellent support. Cotton is drought-resistant and well-suited for your conditions...",
    "nativeResponse": "काली मिट्टी और कम बारिश की स्थिति के लिए, मैं कपास को आपकी मुख्य फसल के रूप में सुझाता हूं। काली मिट्टी कपास की खेती के लिए आदर्श है...",
    "recommendations": [
      {
        "crop": "Cotton",
        "suitability": "high",
        "reason": "Well-suited for black soil, drought-resistant",
        "duration": "180-200 days",
        "waterRequirement": "moderate",
        "benefits": "Cash crop, good market demand"
      },
      {
        "crop": "Sorghum",
        "suitability": "high",
        "reason": "Drought resistant, suitable for black soil",
        "duration": "100-120 days",
        "waterRequirement": "low",
        "benefits": "Quick harvest, nutritious"
      }
    ],
    "additionalTips": [
      "Black soil retains moisture well - avoid over-watering",
      "Consider crop rotation with legumes to maintain soil fertility",
      "Keep weather forecasts in mind for planning"
    ],
    "language": "hi",
    "farmerContext": {
      "soilType": "black",
      "season": "kharif",
      "irrigation": "rainfed"
    }
  },
  "timestamp": "2025-07-11T10:30:00Z",
  "processingTime": "2847ms"
}
```

## Error Response

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": [
      {
        "field": "question",
        "message": "Question is required"
      },
      {
        "field": "language",
        "message": "Language is required"
      }
    ]
  },
  "timestamp": "2025-07-11T10:30:00Z"
}
```
