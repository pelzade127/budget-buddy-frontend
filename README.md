# 💰 Budget Buddy

> A full-stack budget tracking application designed with ADHD-friendly UX principles. Track expenses, manage categories, and visualize spending patterns across all your devices.

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://budget-buddy-frontend-pi.vercel.app)
[![Backend Status](https://img.shields.io/badge/backend-railway-blueviolet?style=for-the-badge)](https://backend-production-6e92.up.railway.app)

## ✨ Features

### 🎨 **ADHD-Friendly Design**
- **3-tap expense entry** - Add transactions in seconds
- **Visual budget indicators** - Color-coded progress bars
- **6 customizable themes** - Match your mood
- **Quick category navigation** - No scrolling through long lists

### 💸 **Smart Budgeting**
- **12 pre-configured categories** - Groceries, rent, entertainment, and more
- **Auto-scaling budgets** - Adjusts proportionally to your income
- **Real-time tracking** - See spending updates instantly
- **Weekly & monthly views** - Track patterns over time

### 📊 **Powerful Analytics**
- **Interactive charts** - Pie charts and bar graphs
- **Spending trends** - Week-by-week analysis
- **Category breakdown** - See where your money goes
- **Monthly history** - Year-long tracking

### 🔄 **Cross-Device Sync**
- **Cloud-powered** - All data synced to PostgreSQL
- **Multi-device support** - Access from phone, tablet, or computer
- **Real-time updates** - Changes appear everywhere instantly
- **Secure authentication** - Email/password + Google OAuth

### 📱 **Mobile Optimized**
- **Responsive design** - Works perfectly on any screen size
- **PWA-ready** - Install as an app on your phone
- **Touch-friendly** - Large buttons and intuitive gestures

---

## 🚀 Tech Stack

### **Frontend**
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Lucide React** - Beautiful icon library
- **CSS-in-JS** - Styled components with inline styling

### **Backend**
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **PostgreSQL** - Robust relational database
- **JWT** - Secure authentication
- **Passport.js** - Google OAuth integration

### **DevOps**
- **Vercel** - Frontend hosting (CDN-powered)
- **Railway** - Backend hosting with PostgreSQL
- **GitHub** - Version control
- **CORS** - Secure cross-origin requests

---

## 📸 Screenshots

### Dashboard
![Dashboard View](https://github.com/user-attachments/assets/bf8c2712-877f-4e16-9c6c-9878533573a3)
*Main dashboard showing budget categories and spending overview*

### Quick Add Expense
![Quick Add](https://github.com/user-attachments/assets/f7eb10c4-8cd5-4d93-8d02-5142d9dbb4d5)
*3-tap expense entry - category, amount, description*

### Analytics
<p float="left">
  <img src="https://github.com/user-attachments/assets/57909a90-7e04-4e5c-9997-c1af9d0fd3a4" width="400" />
  <img src="https://github.com/user-attachments/assets/9b9080fb-9d2e-4ba8-8d8d-a9354466dd03" width="400" />
</p>
*Visual breakdown of spending patterns with charts*

### Theme Options
<p float="left">
  <img src="https://github.com/user-attachments/assets/4a1261d1-2b5b-498b-a799-6e243b4e1c3f" width="400" />
  <img src="https://github.com/user-attachments/assets/869e372e-65be-42e5-af01-b8e7e66ebfd6" width="400" />
</p>
*6 beautiful color themes to choose from*

---

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (or use Railway)

### **Frontend Setup**

```bash
# Clone the repository
git clone https://github.com/pelzade127/budget-buddy-frontend.git
cd budget-buddy-frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:3001" > .env

# Start development server
npm run dev
```

Frontend will be running at `http://localhost:5173`

### **Backend Setup**

```bash
# Clone backend repository
git clone https://github.com/pelzade127/budget-buddy-backend.git
cd budget-buddy-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npm run migrate

# Start server
npm start
```

Backend will be running at `http://localhost:3001`

---

## 🌐 Deployment

### **Frontend (Vercel)**

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variable: `VITE_API_URL=<your-backend-url>`
4. Deploy!

### **Backend (Railway)**

1. Push code to GitHub
2. Create new Railway project
3. Add PostgreSQL plugin
4. Set environment variables
5. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

---

## 🔑 Environment Variables

### **Frontend (.env)**
```bash
VITE_API_URL=https://your-backend-url.railway.app
```

### **Backend (.env)**
```bash
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-jwt-secret-key
SESSION_SECRET=your-session-secret
FRONTEND_URL=https://your-frontend-url.vercel.app
GOOGLE_CLIENT_ID=your-google-oauth-id
GOOGLE_CLIENT_SECRET=your-google-oauth-secret
```

---

## 📚 API Documentation

### **Authentication**
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Login with Google OAuth

### **Categories**
- `GET /api/categories` - Get all user categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### **Transactions**
- `GET /api/transactions` - Get all transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### **User Profile**
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/settings` - Update user settings

---

## 🎨 Design Philosophy

Budget Buddy was designed with **neurodivergent users** in mind:

- **Minimal cognitive load** - Only show what's needed
- **Fast interactions** - 3 taps to add an expense
- **Visual feedback** - Color-coded progress indicators
- **Consistent patterns** - Same interactions throughout
- **No overwhelming choices** - Sensible defaults
- **Forgiving UX** - Easy to edit or delete mistakes

---

## 🚧 Roadmap

- [ ] Recurring transactions (subscriptions, bills)
- [ ] Budget goals and alerts
- [ ] Export data (CSV, PDF)
- [ ] Expense categories autocomplete
- [ ] Receipt photo uploads
- [ ] Shared budgets (family/roommates)
- [ ] Bill reminders
- [ ] Savings goals tracker

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Esther "Pelz" Ademuwagun**
- LinkedIn: [linkedin.com/in/yourprofile](https://www.linkedin.com/in/esther-ademuwagun-533031180/)
- GitHub: [@yourusername](https://github.com/pelzade127)

---

## 🙏 Acknowledgments

- Built with guidance from Claude (Anthropic)
- Icons by [Lucide](https://lucide.dev)
- Hosted on [Vercel](https://vercel.com) and [Railway](https://railway.app)
- Designed for neurodivergent users

---

## 📞 Support

If you have any questions or run into issues:
- Open an [issue](https://github.com/pelzade127/budget-buddy-frontend/issues)
- Email: estherade127@gmail.com

---

<p align="center">Made with ❤️ for better budgeting</p>
