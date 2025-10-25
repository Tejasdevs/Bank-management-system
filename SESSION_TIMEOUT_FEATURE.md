# 🔐 Session Timeout Feature - Auto Logout

## ✨ Overview

Implemented **automatic session timeout** that logs out users after **15 minutes of inactivity** for enhanced security.

---

## 🎯 Features

### 1. **Inactivity Detection**
- Tracks user activity (mouse, keyboard, touch, scroll)
- Resets timer on any user interaction
- Works seamlessly in the background

### 2. **Warning Modal**
- Shows warning **1 minute before logout** (at 14 minutes)
- **60-second countdown** with visual progress
- Option to **Stay Logged In** or **Logout Now**
- Beautiful gradient design with animations

### 3. **Automatic Logout**
- Logs out user after 15 minutes of inactivity
- Clears session storage (token & user data)
- Redirects to login page with message
- Preserves localStorage data (investments, etc.)

### 4. **Session Expired Message**
- Shows info alert on login page
- Auto-dismisses after 5 seconds
- Clear indication of why user was logged out

---

## 📦 Files Created

### 1. **SessionTimeout.jsx**
Location: `frontend/src/components/SessionTimeout.jsx`

**Features:**
- Activity tracking with multiple event listeners
- Timer management (warning + logout)
- Countdown display
- Modal UI with actions

### 2. **sessionTimeout.css**
Location: `frontend/src/styles/sessionTimeout.css`

**Features:**
- Beautiful gradient modal design
- Pulse animations for icon
- Countdown animation
- Responsive design
- Dark mode support

---

## 🔧 Implementation Details

### Component Structure

```jsx
<SessionTimeout timeout={900000} />
```

**Props:**
- `timeout` - Time in milliseconds (default: 900000ms = 15 minutes)

### Activity Events Tracked
- `mousedown` - Mouse clicks
- `mousemove` - Mouse movement
- `keypress` - Keyboard input
- `scroll` - Page scrolling
- `touchstart` - Touch events (mobile)
- `click` - Click events

### Timer Logic
1. **Initial Timer:** 15 minutes
2. **Warning Timer:** Shows at 14 minutes
3. **Countdown:** 60 seconds visible countdown
4. **Auto Logout:** At 15 minutes if no action taken

---

## 🎨 UI/UX Features

### Warning Modal Design
- **Gradient Background:** Purple gradient (#667eea → #764ba2)
- **Animated Icon:** Pulsing clock emoji ⏰
- **Countdown Display:** Large, highlighted countdown
- **Two Action Buttons:**
  - **Stay Logged In** - Resets timer
  - **Logout Now** - Immediate logout

### Animations
- **Fade In:** Smooth overlay appearance
- **Slide Up:** Modal slides from bottom
- **Pulse:** Icon pulses continuously
- **Countdown Pulse:** Number background pulses
- **Rotate:** Background decoration rotates

### Responsive Design
- Desktop: Side-by-side buttons
- Mobile: Stacked buttons
- Smaller modal on mobile
- Touch-friendly button sizes

---

## 🔒 Security Benefits

1. **Prevents Unauthorized Access**
   - Auto-logout protects unattended sessions
   - Reduces risk of account hijacking

2. **Compliance Ready**
   - Meets security standards for financial apps
   - Configurable timeout duration

3. **User Awareness**
   - Warning before logout
   - Clear session expired message

---

## 📱 How It Works

### User Journey

1. **User logs in** → Timer starts (15 minutes)
2. **User is active** → Timer resets on each activity
3. **User goes idle** → Timer continues counting
4. **14 minutes pass** → Warning modal appears
5. **User has 2 options:**
   - Click "Stay Logged In" → Timer resets, continues session
   - Click "Logout Now" → Immediate logout
   - Do nothing → Auto logout after 60 seconds
6. **After logout** → Redirected to login with message

---

## ⚙️ Configuration

### Change Timeout Duration

In `Dashboard.jsx`:
```jsx
<SessionTimeout timeout={900000} /> // 15 minutes (default)
```

**Common Values:**
- 5 minutes: `300000`
- 10 minutes: `600000`
- 15 minutes: `900000` (default)
- 30 minutes: `1800000`
- 1 hour: `3600000`

### Change Warning Time

In `SessionTimeout.jsx`, line 46:
```jsx
warningTimeoutId = setTimeout(() => {
  setShowWarning(true);
  // ...
}, timeout - 60000); // Shows 1 minute before
```

Change `60000` to adjust warning time.

---

## 🎯 Integration

### Files Modified

1. **Dashboard.jsx**
   - Added SessionTimeout import
   - Added component to render

2. **Login.jsx**
   - Added session expired message support
   - Shows info alert when redirected

3. **App.jsx**
   - Imported sessionTimeout.css

4. **style.css**
   - Added info-alert styles

---

## 🧪 Testing

### Test Scenarios

#### 1. **Normal Activity**
- Use the app normally
- Timer should reset with each interaction
- No warning should appear

#### 2. **Idle Timeout**
- Login and don't interact
- Wait 14 minutes
- Warning modal should appear
- Countdown from 60 seconds
- Auto logout at 15 minutes

#### 3. **Stay Logged In**
- Trigger warning modal
- Click "Stay Logged In"
- Timer should reset
- Modal should close
- Session continues

#### 4. **Manual Logout**
- Trigger warning modal
- Click "Logout Now"
- Should logout immediately
- Redirect to login with message

#### 5. **Session Expired Message**
- Get logged out due to timeout
- Check login page
- Should see blue info alert
- Message disappears after 5 seconds

---

## 🎨 Customization

### Change Modal Colors

In `sessionTimeout.css`:
```css
.session-timeout-modal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  /* Change these colors */
}
```

### Change Button Styles

```css
.btn-stay {
  background: white;
  color: #667eea;
  /* Customize */
}

.btn-logout {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  /* Customize */
}
```

### Disable Animations

Remove or comment out animation properties in CSS.

---

## 🐛 Troubleshooting

### Issue: Timer not resetting
**Solution:** Check if event listeners are properly attached. Open console and check for errors.

### Issue: Warning not showing
**Solution:** Verify timeout value is correct and component is rendered.

### Issue: Multiple timers running
**Solution:** Component properly cleans up timers in useEffect cleanup function.

### Issue: Session expired message not showing
**Solution:** Check if Login.jsx has useLocation and useEffect properly set up.

---

## 💡 Best Practices

1. **Don't set timeout too short**
   - Minimum recommended: 5 minutes
   - Optimal for banking: 10-15 minutes

2. **Always show warning**
   - Give users time to react
   - At least 30-60 seconds warning

3. **Clear session data**
   - Remove tokens on logout
   - Keep non-sensitive data (like investments)

4. **User feedback**
   - Show why they were logged out
   - Make it easy to log back in

---

## 🔐 Security Notes

### What Gets Cleared
✅ Session token (`bms_token`)
✅ User data (`bms_user`)

### What Stays
✅ Investments (localStorage)
✅ Dark mode preference
✅ Other non-sensitive settings

### Why This Matters
- Prevents unauthorized access to financial data
- Protects against session hijacking
- Complies with security best practices

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Default Timeout | 15 minutes |
| Warning Time | 1 minute before |
| Countdown Duration | 60 seconds |
| Events Tracked | 6 types |
| Files Created | 2 |
| Files Modified | 4 |
| Lines of Code | ~250 |

---

## ✅ Feature Checklist

- ✅ Inactivity detection
- ✅ Automatic logout after 15 minutes
- ✅ Warning modal with countdown
- ✅ Stay logged in option
- ✅ Manual logout option
- ✅ Session expired message
- ✅ Beautiful UI design
- ✅ Responsive design
- ✅ Dark mode support
- ✅ No impact on existing features

---

## 🎉 Result

Your Bank Management System now has:
- ✅ Enhanced security with auto-logout
- ✅ User-friendly warning system
- ✅ Professional session management
- ✅ Better compliance with security standards
- ✅ Improved user experience

**Users are now protected from unauthorized access when they leave their session unattended!** 🔒
