# Oicho-Kabu Mobile Game - Design Guidelines

## Architecture Decisions

### Authentication
**No Authentication Required** - This is a single-device game with local peer-to-peer multiplayer.

**Profile System:**
- Include a local player profile accessible from Settings
- Player customization:
  - Display name field (default: "Player")
  - Avatar selection: Generate 4 traditional Japanese-themed avatar presets (simple geometric designs inspired by mon/kamon family crests)
  - Win/loss statistics stored locally
  - Game preferences (sound effects, card animation speed)

### Navigation Architecture
**Stack-Only Navigation** with drawer for secondary features:

**Main Stack:**
1. **Home Screen** (entry point)
2. **Game Screen** (single-player vs AI)
3. **Multiplayer Lobby** (Bluetooth connection)
4. **Multiplayer Game Screen** (peer-to-peer)
5. **Game Results** (modal overlay on game screen)

**Drawer Navigation** (accessible via hamburger menu from Home):
- Rules & Tutorial
- Statistics
- Settings
- About

### Information Architecture
```
Home (Main Menu)
├── Play vs AI → Game Screen → Results Modal
├── Play vs Friend → Lobby → Game Screen → Results Modal
└── Drawer Menu
    ├── How to Play (Rules & Tutorial)
    ├── Statistics
    ├── Settings (with Profile)
    └── About
```

## Screen Specifications

### 1. Home Screen (Main Menu)
**Purpose:** Entry point for selecting game mode

**Layout:**
- Header: Custom transparent header with app title "Oicho-Kabu" in elegant typography, hamburger menu icon (left)
- Main content: Centered vertical stack, not scrollable
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- App logo/title card at top with subtle Japanese aesthetic (minimalist design)
- Two large primary action buttons:
  - "Play vs AI" (offline mode)
  - "Play vs Friend" (Bluetooth multiplayer)
- Win/loss record displayed below buttons (e.g., "W: 12 | L: 8 | D: 3")
- Visual feedback: Buttons scale slightly (0.95) when pressed

### 2. Game Screen (Main Gameplay)
**Purpose:** Active card game interface

**Layout:**
- Header: Transparent header showing round number and current dealer, no buttons
- Main content: Fixed layout (not scrollable)
- Safe area: top = insets.top + Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- **Opponent area** (top third):
  - AI/opponent cards facedown initially, then revealed
  - Score display when cards are revealed
- **Table center** (middle third):
  - Deck pile (facedown)
  - Discard pile (faceup)
  - Current round indicator
  - Dealer button indicator
- **Player area** (bottom third):
  - Player's hand (cards spread horizontally)
  - Player's score display
  - Action buttons: "Draw Card", "Stand", "Fold" (context-dependent visibility)
- **Floating pause button** (top-right): Opens modal with options to resume, view rules, or quit
  - Shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

**Card Animations:**
- Dealing: Cards slide from deck to player positions (300ms ease-out)
- Flip: 3D rotation on Y-axis (200ms)
- Draw: Smooth slide from deck (250ms)

### 3. Multiplayer Lobby Screen
**Purpose:** Bluetooth device discovery and connection

**Layout:**
- Header: Default navigation header with back button (left), title "Find Opponent"
- Main content: ScrollView
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- Connection status indicator at top
- "Host Game" button (creates discoverable session)
- Divider with "OR"
- "Join Game" section with list of nearby devices
- Each device row shows: device name, signal strength indicator, "Connect" button
- Loading spinner while scanning
- Visual feedback: List items highlight on press

### 4. Game Results Modal
**Purpose:** Display round/game outcome

**Layout:**
- Semi-transparent overlay (backdrop opacity: 0.7)
- Centered card modal (80% screen width)
- Not scrollable

**Components:**
- Result headline: "You Win!", "You Lose", "Draw" (large, bold)
- Point breakdown showing final scores
- In case of **draw**: Show "Draw - No Points Awarded" message prominently
- Buttons:
  - "Play Again" (primary)
  - "Main Menu" (secondary)
- Visual feedback: Buttons have press state

### 5. Rules & Tutorial Screen
**Purpose:** Explain Oicho-Kabu game rules

**Layout:**
- Header: Default navigation header with back button, title "How to Play"
- Main content: ScrollView with rich formatting
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- Sections with headings:
  - Objective
  - Card Values (with visual card examples)
  - Gameplay Flow
  - Scoring Rules
  - Draw Conditions (emphasize no points awarded)
- Illustrated examples using card graphics
- Interactive tutorial button at bottom (optional walkthrough)

### 6. Settings Screen
**Purpose:** Game preferences and player profile

**Layout:**
- Header: Default navigation header with back button, title "Settings"
- Main content: ScrollView form
- Safe area: top = Spacing.xl, bottom = insets.bottom + Spacing.xl

**Components:**
- **Profile Section:**
  - Avatar selection (horizontal scrollable row of 4 presets)
  - Display name text input
- **Game Preferences:**
  - Sound effects toggle
  - Card animation speed slider (Slow/Normal/Fast)
  - Vibration feedback toggle
- **Data:**
  - "Reset Statistics" button (confirmation alert)

## Design System

### Color Palette
**Japanese Traditional Theme:**
- Primary: Deep indigo (#2D3561) - traditional Japanese navy
- Secondary: Crimson red (#C7243A) - traditional aka-iro
- Accent: Gold (#D4AF37) - for highlights and wins
- Background: Soft cream (#F5F3EE) - warm paper texture feel
- Card table: Rich green (#1B5E20) - traditional card table felt
- Text Primary: Near-black (#1A1A1A)
- Text Secondary: Charcoal gray (#555555)
- Error/Loss: Muted red (#D32F2F)
- Success/Win: Forest green (#388E3C)
- Draw: Neutral gray (#757575)

### Typography
- Headings: Clean sans-serif, bold (System Bold or Noto Sans)
- Body: Sans-serif regular (System or Noto Sans)
- Card Values: Monospace or serif for clarity
- Sizes:
  - Title: 28px
  - Heading: 20px
  - Body: 16px
  - Caption: 14px
  - Card Value: 24px (bold)

### Visual Design Principles
- **Cards:** Use standard international playing card graphics (hearts, diamonds, clubs, spades)
- **Buttons:** 
  - Primary: Filled with primary color, white text, rounded corners (12px radius)
  - Secondary: Outlined with secondary color, colored text
  - Press feedback: Scale to 0.95, slight opacity reduction (0.8)
- **Icons:** Use Feather icons from @expo/vector-icons for UI elements (menu, settings, pause)
- **Spacing:** Consistent 8px grid (Spacing.xs=4, sm=8, md=16, lg=24, xl=32)
- **Shadows:** Minimal use - only for floating pause button with exact specs from guidelines

### Critical Assets
1. **Playing Card Set:** Complete 52-card deck in international standard design (hearts, diamonds, clubs, spades)
   - High-resolution card faces
   - Card back design (simple Japanese pattern like seigaiha waves or asanoha hemp leaf)
2. **Avatar Presets (4 total):** Geometric mon-inspired designs
   - Circular badge style
   - Simple, recognizable shapes (crane, chrysanthemum, bamboo, wave)
   - Two-color designs using primary palette
3. **Dealer Button:** Small circular token with "D" or traditional marker

### Accessibility Requirements
- Minimum touch target: 44x44 points for all interactive elements
- High contrast between card values and card backgrounds
- Support for both portrait and landscape orientations on tablets
- Visual indicators for current player turn (border highlight, subtle pulse animation)
- Haptic feedback on card draw and game events (if vibration enabled)
- Clear visual distinction between faceup and facedown cards (shadow/depth)

### Interaction Design
- **Card Selection:** Tap to select/deselect with visual highlight
- **Bluetooth Connection:** Auto-retry on failed connection with user notification
- **Turn Indicators:** Subtle pulsing border around active player's area
- **Error States:** Toast notifications for connection issues, invalid moves
- **Loading States:** Spinner with "Connecting..." or "Waiting for opponent..." message
- **Draw Scenario:** Special visual treatment (neutral color, no confetti) with clear "No Points Awarded" message