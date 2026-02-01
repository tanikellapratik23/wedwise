# Vivaha - Wedding Planning Website 

 A comprehensive, full-stack wedding planning web application built with React, TypeScript, Node.js, and MongoDB. Vivaha helps couples plan their perfect wedding with personalized onboarding and powerful planning tools.


###  Personalized Onboarding Flow
# Vivaha - Wedding Planning Website 
- **Welcome Screen**: Friendly introduction to the platform
- **Role Selection**: Identify who's planning (couple, parent, friend, planner)
- **Preferences**: Wedding style, priorities, budget, guest count, color themes
- **Goals**: Understand user needs and customize experience
- **Summary**: Review and confirm personalized setup
- **Vendor Management**: Store vendor details, quotes, contracts, and status
- **Seating Planner**: Visual drag-and-drop seating arrangement tool
- Modern, intuitive user interface
- Color-coded status indicators
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **MongoDB** - Database
- **Mongoose** - ODM
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/      # Login & Register
│   │   │   ├── onboarding/  # Onboarding flow
│   │   │   └── dashboard/   # Main features
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   └── package.json
│
├── server/                # Backend Node.js API
│   ├── src/
│   │   ├── models/       # MongoDB models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Auth middleware
│   │   └── index.ts
│   └── package.json
│
├── shared/               # Shared TypeScript types
│   └── src/
│       └── types.ts
│
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation
   cd wedwise
   ```

2. **Install dependencies**
   
   Install all dependencies in one go:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   cd ../shared && npm install
   cd ..
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `server` directory:
   ```bash
   cp server/.env.example server/.env
   ```
   
   Edit `server/.env` with your settings:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/wedwise
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=development
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running:
   ```bash
   # macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # Or use Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   
   **Option 1: Run both simultaneously (recommended)**
   
   In the root directory, you can open two terminal windows:
   
   Terminal 1 - Backend:
   ```bash
   cd server
   npm run dev
   ```
   
   Terminal 2 - Frontend:
   ```bash
   cd client
   npm run dev
   ```

   **Option 2: Use the VS Code tasks (coming soon)**

6. **Access the application**
   
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/api/health

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Onboarding
- `POST /api/onboarding` - Save onboarding data
### Guests
- `GET /api/guests` - Get all guests
- `DELETE /api/guests/:id` - Delete guest

- `DELETE /api/budget/:id` - Delete budget category

- `DELETE /api/todos/:id` - Delete todo

- `DELETE /api/vendors/:id` - Delete vendor

- Login with your credentials

### 2. Complete Onboarding
- Follow the 5-step personalized onboarding flow

### 3. Start Planning
- **To-Do List**: Create and manage wedding tasks
- **Vendors**: Keep track of all your vendors
- Protected API routes
- Environment variable configuration
- CORS enabled
- [ ] Real-time collaboration
- [ ] File uploads (contracts, photos)
- [ ] AI-powered vendor recommendations
MIT License - feel free to use this project for learning or personal use.


## Troubleshooting

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check the MONGODB_URI in your .env file

**Port Already in Use**
- Change the PORT in server/.env
**Dependencies Issues**
- Delete node_modules and package-lock.json
## Support
