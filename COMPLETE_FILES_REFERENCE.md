# 📦 Complete File Reference for Animated Login/Signup Pages

## Files to Copy After Setup

### 1. Main Components

#### `src/components/ui/animated-characters-login-page.tsx`
- Location: See `animated-characters-login-page.tsx` in the user request
- This is the main login page component with animated characters

#### `src/components/ui/animated-characters-signup-page.tsx`
- Location: See `animated-characters-signup-page.tsx` (created in this directory)
- Matching signup page with same animations

---

### 2. Page Files to Create

#### `src/app/login/page.tsx`
```typescript
import { Component } from "@/components/ui/animated-characters-login-page";

export default function LoginPage() {
  return <Component />;
}
```

#### `src/app/signup/page.tsx`
```typescript
import { Component } from "@/components/ui/animated-characters-signup-page";

export default function SignupPage() {
  return <Component />;
}
```

#### `src/app/page.tsx` (Home page - redirect to login)
```typescript
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/login');
}
```

---

### 3. API Integration (Optional - for real backend)

#### `src/lib/api.ts`
```typescript
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/api/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) => 
    api.post('/api/auth/register', { username, email, password }),
};
```

---

### 4. Update Login Component for Real API

Replace the `handleSubmit` function in `animated-characters-login-page.tsx`:

```typescript
import { authAPI } from '@/lib/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setIsLoading(true);

  try {
    const response = await authAPI.login(email, password);
    const { token, user } = response.data;
    
    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (err: any) {
    setError(err.response?.data?.message || "Invalid email or password. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

---

### 5. Update Signup Component for Real API

Replace the `handleSubmit` function in `animated-characters-signup-page.tsx`:

```typescript
import { authAPI } from '@/lib/api';

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");

  // Validation
  if (password !== confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters");
    return;
  }

  setIsLoading(true);

  try {
    const response = await authAPI.register(username, email, password);
    const { token, user } = response.data;
    
    // Store token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect to dashboard
    window.location.href = '/dashboard';
  } catch (err: any) {
    setError(err.response?.data?.message || "Registration failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

---

### 6. Tailwind Config Update

Update `tailwind.config.ts` to add custom primary color:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(262, 90%, 60%)",
          foreground: "hsl(0, 0%, 100%)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

---

### 7. Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## 📝 Installation Checklist

- [ ] Create Next.js project with TypeScript and Tailwind
- [ ] Initialize shadcn/ui
- [ ] Install shadcn components: `button`, `input`, `label`, `checkbox`
- [ ] Install `lucide-react`
- [ ] Copy `animated-characters-login-page.tsx` to `src/components/ui/`
- [ ] Copy `animated-characters-signup-page.tsx` to `src/components/ui/`
- [ ] Create `src/app/login/page.tsx`
- [ ] Create `src/app/signup/page.tsx`
- [ ] Update `src/app/page.tsx` to redirect to login
- [ ] Create `src/lib/api.ts` for backend integration
- [ ] Create `.env.local` with API URL
- [ ] Update Tailwind config with primary color
- [ ] Test login page: `http://localhost:3000/login`
- [ ] Test signup page: `http://localhost:3000/signup`

---

## 🎨 Customization Options

### Change Brand Name
Replace "YourBrand" in both component files with your actual brand name.

### Change Primary Color
In `tailwind.config.ts`, modify:
```typescript
primary: {
  DEFAULT: "hsl(262, 90%, 60%)", // Change this
  foreground: "hsl(0, 0%, 100%)",
}
```

### Change Character Colors
In the component files, modify these hex values:
- Purple character: `#6C3FF5`
- Black character: `#2D2D2D`
- Orange character: `#FF9B6B`
- Yellow character: `#E8D754`

### Modify Animations
Adjust timing in the `useEffect` hooks:
- Blink interval: `Math.random() * 4000 + 3000` (3-7 seconds)
- Blink duration: `150` ms
- Look duration: `800` ms
- Peek interval: `Math.random() * 3000 + 2000` (2-5 seconds)

---

## 🚀 Running the Project

```bash
npm run dev
```

Visit:
- Login: `http://localhost:3000/login`
- Signup: `http://localhost:3000/signup`

---

## 🔗 Backend Integration

Your existing backend at `http://localhost:5000` should have these endpoints:

### POST `/api/auth/login`
Request:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

### POST `/api/auth/register`
Request:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "john@example.com",
    "username": "johndoe"
  }
}
```

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

---

## ❓ Troubleshooting

### "Cannot find module '@/components/ui/button'"
- Run: `npx shadcn@latest add button`

### "cn is not defined"
- Check that `src/lib/utils.ts` exists with the `cn` function

### Characters not animating
- Ensure you're using the component on a client component (`"use client"` at top)
- Check browser console for errors

### API calls failing
- Verify `.env.local` has correct API URL
- Check that backend is running on port 5000
- Check CORS settings on backend

---

## 🎯 Next Steps After Setup

1. Test the login/signup flow
2. Connect to your real backend API
3. Create a dashboard page
4. Add protected routes
5. Implement logout functionality
6. Add password reset flow
7. Migrate other components from old project
