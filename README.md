# 2048 Game with Leaderboard

A modern implementation of the classic 2048 game with a leaderboard system, user authentication, and mobile-responsive design.

## 🎮 Features

- **Classic 2048 Gameplay**: Merge tiles to reach 2048 and beyond
- **Leaderboard System**: Track high scores and compete with other players
- **User Authentication**: Register, login, and save your progress
- **Mobile-Responsive Design**: Play on any device, desktop or mobile
- **Touch Controls**: Smooth touch gestures for mobile devices
- **Responsive UI**: Optimized layout for different screen sizes
- **Beautiful Background**: Custom background images for desktop and mobile
- **Real-time Score Updates**: See your score and best score instantly

## 🛠️ Technologies Used

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Deployment**: Docker support available

## 📋 Game Rules

1. Use arrow keys (desktop) or swipe gestures (mobile) to move tiles
2. Tiles with the same number merge into one when they touch
3. Each move adds a new 2 or 4 tile to the board
4. Reach 2048 to win!
5. The game ends when no more moves are possible

## 🚀 Installation

### Prerequisites

- Node.js (v14+)
- MySQL database
- Git

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/czhbot/game2048.git
   cd game2048
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file with the following variables:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=game2048
   JWT_SECRET=your_jwt_secret
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Initialize the database**
   ```bash
   node server/config/init-db.js
   ```

5. **Start the server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📱 How to Play

### Desktop
- Use arrow keys to move tiles
- Click "重新开始" to start a new game
- Click "继续游戏" to keep playing after reaching 2048

### Mobile
- Swipe up, down, left, or right to move tiles
- Tap "重新开始" to start a new game
- Tap "继续游戏" to keep playing after reaching 2048

## 📁 Project Structure

```
├── background_image/     # Background images
├── public/              # Public assets
├── server/              # Backend code
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   └── app.js           # Main server file
├── game.js              # Game logic
├── grid.js              # Grid management
├── html_actuator.js     # UI rendering
├── index.html           # Main HTML file
├── style.css            # Stylesheets
└── tile.js              # Tile management
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login with existing credentials
- `GET /api/auth/me` - Get current user information

### Leaderboard
- `GET /api/leaderboard` - Get leaderboard data
- `POST /api/leaderboard/submit` - Submit a new score
- `POST /api/leaderboard/start-session` - Start a new game session

### User
- `GET /api/users/me/best-score` - Get user's best score

## 🐳 Docker Deployment

1. **Build the Docker image**
   ```bash
   docker build -t game2048 .
   ```

2. **Run the container**
   ```bash
   docker run -p 3000:3000 --env-file .env game2048
   ```

## 🎨 Customization

### Change Background Image

1. Add your image to the `background_image/` folder
2. Modify `style.css` to use your new image
   ```css
   /* For desktop */
   body {
       background-image: url('background_image/your-image.png');
   }
   
   /* For mobile */
   @media (max-width: 1024px) {
       body {
           background-image: url('background_image/your-mobile-image.jpg');
       }
   }
   ```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some feature'`)
5. Push to the branch (`git push origin feature/YourFeature`)
6. Open a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Original 2048 game by Gabriele Cirulli
- Icons and images from various sources
- Thanks to all contributors

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Enjoy playing 2048! 🎉**