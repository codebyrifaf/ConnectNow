# Social Chat App - React Native Expo

A comprehensive social messaging application built with React Native, Expo, and SQLite. Features user authentication, user discovery, real-time chat functionality, and photo sharing capabilities.

## Features

### � Authentication System
- User registration and login
- Secure user sessions
- Profile management
- Protected routes

### 👥 User Discovery
- Find and connect with other users
- Browse all registered users
- Start conversations with anyone
- No personal/private chats - open social platform

### 💬 Real-time Chat
- Instant messaging with any user
- Message history saved locally
- Auto-scroll to latest messages
- Keyboard-aware interface

### 📸 Photo Sharing
- Send photos from camera or gallery
- Image compression for performance
- Full-screen image viewer
- Tap to enlarge photos in chat

### 🎨 Professional UI Design
- iOS-inspired clean interface
- Consistent color scheme (#007AFF primary)
- Responsive design
- Safe area handling

### � Cross-Platform
- iOS, Android, and Web support
- Platform-specific optimizations
- Native performance

## Technologies Used

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and SDK
- **TypeScript** - Type safety and better development experience
- **Firebase** - Database for data persistence
- **Expo Router** - File-based navigation system
- **AsyncStorage** - Secure local storage for user sessions
- **Expo Image Picker** - Camera and gallery access for photo sharing
- **Expo File System** - File management for image handling
- **React Native Safe Area Context** - Safe area handling
- **Ionicons** - Beautiful vector icons

## Installation & Setup

1. **Clone or download the project**

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Run on device/simulator:**
   - **iOS:** Press `i` in terminal or scan QR code with Expo Go app
   - **Android:** Press `a` in terminal or scan QR code with Expo Go app
   - **Web:** Press `w` in terminal

## How to Use

### First Time Setup
1. **Launch the app** - you'll be taken to the authentication screen
2. **Sign Up** - create a new account with username and password
3. **Sign In** - use your credentials to access the app

### Finding Users to Chat With
1. Go to the **"Users"** tab at the bottom
2. Browse through all registered users
3. Tap on any user to start a conversation
4. You'll be taken to a chat screen with that user

### Chatting
1. **Sending Text Messages:**
   - Type your message in the input field at the bottom
   - Tap the blue send button or press Enter
   - Messages appear instantly in the chat

2. **Sending Photos:**
   - Tap the **camera button** (📷) to the left of the text input
   - Choose "Camera" to take a new photo or "Gallery" to select existing
   - Photos are compressed and sent immediately
   - Tap any image in chat to view full-screen

### Managing Your Profile
1. Go to the **"Profile"** tab
2. View your username and account information
3. Sign out when needed

### Navigation
- **Chats Tab:** View all your active conversations
- **Users Tab:** Discover and start conversations with other users  
- **Profile Tab:** Manage your account and settings

## App Structure

```
app/
├── (tabs)/
│   ├── _layout.tsx        # Tab navigation with auth protection
│   ├── index.tsx          # Chat list screen
│   └── explore.tsx        # User discovery screen
├── chat/
│   └── [id].tsx          # Individual chat screen with photo support
├── auth/
│   ├── signin.tsx        # Sign in screen
│   └── signup.tsx        # Sign up screen
├── profile/
│   └── index.tsx         # User profile screen
└── _layout.tsx           # Root layout with auth context

components/
├── chat/
│   ├── ChatList.tsx      # List of user conversations
│   ├── MessageBubble.tsx # Individual message display (text/image)
│   ├── MessageInput.tsx  # Message input with camera button
│   └── ImageViewer.tsx   # Full-screen image viewer modal
├── ui/
│   └── [various UI components]
└── [themed components]

services/
├── database.ts           # SQLite database operations
└── auth.ts              # Authentication service

contexts/
└── AuthContext.tsx      # Global authentication state
```

## Database Schema

### Users Table
- `id` (TEXT PRIMARY KEY) - Unique user identifier (UUID)
- `username` (TEXT UNIQUE) - User's chosen username
- `displayName` (TEXT) - User's display name
- `passwordHash` (TEXT) - Hashed password for security
- `createdAt` (INTEGER) - Account creation timestamp

### Messages Table
- `id` (INTEGER PRIMARY KEY) - Auto-incrementing message ID
- `text` (TEXT) - Message content (empty for image-only messages)
- `sender` (TEXT) - Name of message sender
- `timestamp` (INTEGER) - Message timestamp
- `chatId` (TEXT) - Chat identifier (combination of user IDs)
- `messageType` (TEXT) - Type: 'text' or 'image'
- `imageUri` (TEXT) - Local path to image file (for image messages)

## Features in Detail

### Authentication System
- Secure user registration with unique usernames
- Password hashing for security
- Persistent login sessions using AsyncStorage
- Protected routes - must be authenticated to access chat features
- Clean sign in/sign up interface

### User Discovery
- Browse all registered users in the app
- No friend requests needed - chat with anyone instantly
- Open social platform designed for meeting new people
- Clean user list interface with easy navigation to chat

### Photo Sharing
- **Camera Integration:** Take photos directly from the app
- **Gallery Access:** Select existing photos from device
- **Image Compression:** Automatic compression for better performance
- **Full-Screen Viewer:** Tap any image to view in full screen
- **Permissions Handling:** Proper camera and gallery permission requests

### Real-time Chat Experience
- Instant message delivery and display
- Auto-scroll to latest messages
- Keyboard-aware interface that adjusts when typing
- Empty state messaging for new conversations
- Message timestamps and sender identification

### Professional UI Design
- **Color Scheme:** iOS-inspired blue (#007AFF) with clean grays
- **Typography:** Clear, readable fonts with proper hierarchy
- **Layout:** Consistent spacing and alignment throughout
- **Icons:** Beautiful Ionicons for all interactive elements
- **Responsive:** Adapts to different screen sizes and orientations

## Development

### Project Architecture
- **Authentication Flow:** Context-based auth state management
- **Navigation:** Expo Router with protected routes and dynamic parameters
- **Database:** SQLite with service layer abstraction
- **State Management:** React hooks with proper dependency handling
- **Type Safety:** Full TypeScript implementation with interfaces

### Key Components
- **AuthContext:** Global authentication state and user management
- **DatabaseService:** Centralized database operations with error handling
- **MessageInput:** Advanced input with image picker integration
- **MessageBubble:** Smart message rendering for text and images
- **ImageViewer:** Modal component for full-screen image viewing

### Performance Optimizations
- Image compression for photo sharing
- Efficient FlatList rendering for messages
- Proper keyboard handling and dismissal
- Safe area management for different devices
- Optimized SQLite queries with proper indexing

## Troubleshooting

### Camera Button Not Visible
If you don't see the camera button in the chat:
1. **Restart the app completely** - Close and reopen the app
2. **Clear Metro cache:** `npm start -- --clear`
3. **Rebuild the app:** Stop the development server and run `npm start` again
4. **Check permissions:** Ensure camera/gallery permissions are granted

### Authentication Issues
- Make sure you're entering a unique username during signup
- Passwords are case-sensitive
- Try signing out and signing back in

### App Won't Start
- Ensure all dependencies are installed: `npm install`
- Clear npm cache: `npm start -- --clear`
- Check Node.js version compatibility with Expo

### Database Issues
- The app automatically creates tables on first run
- If experiencing data issues, uninstall and reinstall the app
- Check console for any SQLite error messages

### Photo Sharing Problems
- Grant camera and gallery permissions when prompted
- Ensure device has sufficient storage space
- Try taking a photo instead of selecting from gallery (or vice versa)

## Future Enhancements

Potential features to add:
- **Real-time Sync:** Backend server with WebSocket connections
- **Push Notifications:** Message notifications when app is closed
- **Message Reactions:** Emoji reactions to messages
- **Voice Messages:** Audio message recording and playback
- **File Sharing:** Send documents, videos, and other files
- **Group Chats:** Multi-user conversations
- **Message Search:** Search through chat history
- **User Status:** Online/offline indicators
- **Message Encryption:** End-to-end encryption for privacy
- **Dark Theme:** Complete dark mode implementation
- **Message Forwarding:** Forward messages between chats
- **Chat Backup:** Cloud backup and restore functionality

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Make your changes following the existing code style
4. Test thoroughly on both iOS and Android
5. Commit your changes (`git commit -am 'Add new feature'`)
6. Push to the branch (`git push origin feature/new-feature`)
7. Submit a pull request

## Educational Purpose

This project was developed as part of SWE 4637 - Web and Mobile Application Development course. It demonstrates:
- Modern React Native development practices
- Firebase database integration
- Authentication implementation
- Image handling in mobile apps
- Professional UI/UX design principles
- Cross-platform mobile development

## License

This project is for educational purposes and academic use.
