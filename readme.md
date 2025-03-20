# Photo Manager

A web application for managing and organizing photos with features like albums, sharing, and real-time collaboration.

## Features

- User authentication with local and Facebook login
- Photo upload and management
- Album creation and organization
- Real-time updates using WebSocket
- Responsive design with Tailwind CSS
- Image processing with Sharp

## Prerequisites

- Node.js >= 14.0.0
- npm or yarn
- Facebook Developer Account (for Facebook login)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd photo-manager
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
SESSION_SECRET=your-secret-key
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_CALLBACK_URL=http://localhost:3000/auth/facebook/callback
```

4. Create the uploads directory:
```bash
mkdir uploads
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Production

Build and start the production server:
```bash
npm start
```

## Project Structure

```
photo-manager/
├── src/
│   ├── models/         # Database models
│   ├── routes/         # Express routes
│   ├── views/          # Pug templates
│   ├── public/         # Static files
│   ├── services/       # Business logic
│   └── index.js        # Application entry point
├── uploads/            # Uploaded files
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── README.md         # Documentation
```

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login with email/password
- `GET /auth/facebook` - Facebook login
- `GET /auth/facebook/callback` - Facebook login callback
- `GET /auth/logout` - Logout

### Photos
- `GET /photos` - List all photos
- `GET /photos/:id` - Get photo details
- `POST /photos` - Upload a new photo
- `PUT /photos/:id` - Update photo details
- `DELETE /photos/:id` - Delete a photo

### Albums
- `GET /albums` - List all albums
- `GET /albums/:id` - Get album details
- `POST /albums` - Create a new album
- `PUT /albums/:id` - Update album details
- `DELETE /albums/:id` - Delete an album

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.