# Deployment Guide

## Environment Setup

### 1. Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=production
PORT=3000

# API Keys (Required)
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here
OPENAI_API_KEY=your_openai_api_key_here  # Optional but recommended

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Cache Configuration
CACHE_TTL_SECONDS=3600  # 1 hour

# Security (Optional)
VALID_API_KEYS=key1,key2,key3  # Comma-separated API keys for production
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Logging
LOG_LEVEL=info
```

### 2. Getting API Keys

#### Hugging Face API Key (Required)
1. Visit [Hugging Face](https://huggingface.co/)
2. Create an account and go to Settings > Access Tokens
3. Create a new token with "Read" permissions
4. Copy the token to your `.env` file

#### OpenAI API Key (Optional)
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and go to API Keys
3. Create a new API key
4. Copy the key to your `.env` file

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Start production server
npm start
```

## Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["npm", "start"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  agriguru-api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

## Cloud Deployment

### Railway
1. Connect your GitHub repository to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically on push

### Render
1. Connect repository to Render
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables

### Heroku
```bash
# Install Heroku CLI and login
heroku create agriguru-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set HUGGING_FACE_API_KEY=your_key

# Deploy
git push heroku main
```

### AWS EC2
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone your-repo-url
cd agriguru-apiv3

# Install dependencies
npm install --production

# Install PM2 for process management
sudo npm install -g pm2

# Start application
pm2 start server.js --name agriguru-api

# Setup startup script
pm2 startup
pm2 save
```

## Production Considerations

### 1. Security
- Use HTTPS in production
- Implement proper API key management
- Set up CORS properly
- Use helmet.js for security headers

### 2. Monitoring
- Monitor API response times
- Set up error tracking (Sentry, etc.)
- Monitor cache hit rates
- Track API usage patterns

### 3. Scaling
- Use load balancers for multiple instances
- Implement Redis for shared caching
- Consider rate limiting per user
- Monitor memory and CPU usage

### 4. Backup & Recovery
- Backup logs regularly
- Monitor disk space
- Set up health checks
- Implement graceful shutdown

## Environment-Specific Configurations

### Development
```env
NODE_ENV=development
LOG_LEVEL=debug
CACHE_TTL_SECONDS=300
```

### Staging
```env
NODE_ENV=staging
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=50
```

### Production
```env
NODE_ENV=production
LOG_LEVEL=warn
RATE_LIMIT_MAX_REQUESTS=100
```

## Troubleshooting

### Common Issues
1. **Translation API Errors**: Check Hugging Face API key and quota
2. **High Response Times**: Monitor cache hit rates and API timeouts
3. **Memory Issues**: Check for memory leaks in long-running processes
4. **Rate Limiting**: Adjust limits based on usage patterns

### Health Monitoring
Monitor these endpoints:
- `GET /health` - Basic health check
- `GET /api/v1/crop-advice/stats` - Cache and usage statistics
