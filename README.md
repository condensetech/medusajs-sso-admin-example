# Medusa Store SSO Example

This repository is an example Medusa store demonstrating Single Sign-On (SSO) integration for the admin dashboard.

> 📖 **Read the full implementation guide**: [Implementing SSO for MedusaJS Admin Dashboard](https://medium.com/p/98e80b797781)

## Requirements

- Node.js 20+
- Docker
- Docker Compose

## Google OAuth Setup

### 1. Create Google OAuth Client

1. Create a Google OAuth Client. Ensure to specify the following:
  - Authorized origins: `http://localhost:9000`
  - Authorized redirect URIs: `http://localhost:9000/app/login?provider=google`
2. Note down your `Client ID` and `Client Secret`

### 2. Environment Variables

Copy `.env.template` to `.env` and fill in the following required values:

```env
# Google OAuth Configuration
MEDUSA_AUTH_GOOGLE_CLIENT_ID=your_google_client_id_here
MEDUSA_AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
```

## Running the Store

To start the store and all required services:

- run `npm run docker:up`
