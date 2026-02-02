# Activerse - Next.js Booking System

A modern, full-stack booking system for Activerse arcade and entertainment location, built with Next.js 14, TypeScript, MongoDB, and deployed on Vercel.

## Features

- 🎮 **Interactive Landing Page** - Beautiful, responsive design with game showcases
- 📅 **Booking System** - Real-time booking with availability checking (max 24 guests per slot)
- 🔐 **Admin Dashboard** - Complete booking management system with authentication
- 📧 **Email Notifications** - Automated booking confirmation emails
- 📱 **Responsive Design** - Works perfectly on all devices
- ⚡ **Next.js 14** - Latest Next.js with App Router and Server Components
- 🗄️ **MongoDB** - Scalable database with Mongoose ODM
- 🔒 **Secure Sessions** - Iron-session based authentication

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: Iron-session
- **Styling**: CSS Modules + Global CSS
- **Email**: Nodemailer (Gmail)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB Atlas account (or local MongoDB instance)
- Gmail account with App Password (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   cd activerse-nextjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # MongoDB Connection
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/activerse?retryWrites=true&w=majority

   # Session Secret (generate a random string, at least 32 characters)
   SESSION_SECRET=your-super-secret-session-key-change-in-production-min-32-chars

   # Admin User Credentials
   ADMIN_USERNAME=admin
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=change-this-password

   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   CONTACT_EMAIL=your-email@gmail.com
   ADMIN_EMAIL=admin@example.com

   # Razorpay Payment Gateway (Test Mode)
   RAZORPAY_KEY_ID=your-razorpay-key-id
   RAZORPAY_KEY_SECRET=your-razorpay-key-secret
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

   # Slot Pricing Configuration
   SLOT_1_PRICE=1000          # Price for 30 minutes slot (per person)
   SLOT_2_PRICE=1500          # Price for 1 hour slot (per person)
   NEXT_PUBLIC_SLOT_1_PRICE=1000  # Client-side accessible (30 minutes)
   NEXT_PUBLIC_SLOT_2_PRICE=1500  # Client-side accessible (1 hour)

   # Node Environment
   NODE_ENV=development
   ```

4. **Set up Gmail App Password**
   - Go to your Google Account settings
   - Enable 2-Step Verification
   - Go to App Passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
activerse-nextjs/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── bookings/     # Booking endpoints
│   │   ├── stats/        # Statistics endpoint
│   │   ├── newsletter/   # Newsletter subscription
│   │   └── contact/      # Contact form
│   ├── login/            # Login page
│   ├── bookings/         # Admin bookings page
│   ├── forgot-password/  # Password reset request
│   ├── reset-password/   # Password reset
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── BookingModal.tsx
│   ├── Navigation.tsx
│   └── NewsletterForm.tsx
├── lib/                  # Utility functions
│   ├── mongodb.ts        # Database connection
│   ├── session.ts        # Session management
│   ├── emailNotifications.ts
│   └── adminInit.ts     # Admin user initialization
├── models/               # Mongoose models
│   ├── User.ts
│   ├── Booking.ts
│   ├── TimeSlot.ts
│   ├── Subscriber.ts
│   └── PasswordResetToken.ts
└── public/              # Static assets
    ├── logo.png
    └── games/           # Game images
```

## API Endpoints

### Authentication
- `GET /api/auth/check` - Check authentication status
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/change-password` - Change password (protected)
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

### Bookings
- `GET /api/bookings` - Get all bookings (protected)
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/[id]` - Get single booking (protected)
- `PUT /api/bookings/[id]` - Update booking (protected)
- `DELETE /api/bookings/[id]` - Delete booking (protected)

### Other
- `GET /api/stats` - Get booking statistics (protected)
- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `POST /api/contact` - Send contact form message
- `GET /api/availability/[date]` - Get available time slots

## Deployment

### Deploy to Vercel

1. **Push your code to GitHub**

2. **Import project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add environment variables**
   - In Vercel project settings, add all variables from `.env.local`
   - Make sure `NODE_ENV=production`

4. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Environment Variables for Production

Make sure to set these in Vercel:
- `MONGODB_URI`
- `SESSION_SECRET` (use a strong, random string)
- `ADMIN_USERNAME`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD` (use a strong password)
- `EMAIL_USER`
- `EMAIL_PASSWORD`
- `CONTACT_EMAIL`
- `NODE_ENV=production`

## Features in Detail

### Booking System
- Maximum 24 guests per time slot
- Real-time availability checking
- Booking confirmation emails
- Admin can accept, cancel, or delete bookings

### Admin Dashboard
- View all bookings with filtering
- Statistics dashboard
- Update booking status
- Delete bookings
- Change password

### Security
- Session-based authentication
- Password hashing with bcrypt
- Protected API routes
- Secure session cookies

## Default Admin Credentials

After first deployment, the admin user is automatically created with:
- Username: `admin` (or from `ADMIN_USERNAME`)
- Email: `admin@example.com` (or from `ADMIN_EMAIL`)
- Password: `change-this-password` (or from `ADMIN_PASSWORD`)

**⚠️ IMPORTANT**: Change the default admin password immediately after first login!

## Troubleshooting

### MongoDB Connection Issues
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas IP whitelist (should allow all IPs: `0.0.0.0/0`)
- Verify network access in MongoDB Atlas

### Email Not Sending
- Verify Gmail App Password is correct
- Check that 2-Step Verification is enabled
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly

### Session Issues
- Ensure `SESSION_SECRET` is at least 32 characters
- Check that cookies are enabled in browser
- Verify `NODE_ENV` is set correctly

## License

ISC

## Support

For issues or questions, please contact: Activersepvtltd@gmail.com
