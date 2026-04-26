# ReliefSync AI - Real-time Crisis Coordination System

A fully functional, logic-driven MVP for crisis management with AI-powered volunteer matching.

## System Architecture

### Core Engines

#### 1. **Report Engine** (`/app` → form input)
- Text input with voice simulation and CSV upload
- Creates unstructured report objects
- Auto-triggers AI processing pipeline

#### 2. **AI Parsing Engine** (`/core/ai/parser.ts`)
- Extracts structured data from unstructured text
- **Outputs:**
  - Need type (medical/food/shelter)
  - Number of people affected
  - Location extraction
  - Urgency keywords detection
- **Example:**
  ```
  Input: "8 people injured need urgent medical help near Bangalore"
  Output: { type: ["medical"], people: 8, location: "Bangalore", keywords: ["injured", "urgent"] }
  ```

#### 3. **Urgency Scoring Engine** (`/core/scoring/urgency.ts`)
- Deterministic scoring algorithm
- **Scoring rules:**
  - Medical: +50 points
  - Food: +30 points
  - Shelter: +20 points
  - Per person: +2 points each
  - Keyword bonuses:
    - Critical/dying: +30
    - Urgent/emergency: +20
    - Injured: +25
- **Output:** Score (0-100) + Level (low/medium/high)

#### 4. **Volunteer Matching Engine** (`/core/matching/algorithm.ts`)
- Smart algorithm combining multiple factors:
  - **Skill matching** (50% weight) - matches volunteer skills to crisis type
  - **Proximity** (30% weight) - distance-based scoring using simplified Euclidean distance
  - **Availability** (20% weight) - prioritizes available volunteers
- **Returns:** Top 3 matched volunteers with match scores and reasoning

#### 5. **Task Engine** (`/store/crisisStore.ts` - core of system)
- Manages complete task lifecycle
- **Statuses:** pending → assigned → in_progress → completed
- Real-time state synchronization across all components
- Auto-creates tasks from processed reports
- Tracks task-volunteer relationships

#### 6. **Notification Engine**
- Event-triggered notifications (assignment, update, completion)
- Toast popup + persistent notification center
- Read/unread status tracking

#### 7. **Map System** (`/components/CrisisMap.tsx`)
- Simulated grid-based map visualization
- Crisis markers colored by urgency (red/yellow/blue)
- Interactive marker details on click
- Shows location context

#### 8. **Volunteer Panel** (`/components/VolunteerPanel.tsx`)
- Per-volunteer task dashboard
- Accept/start/complete task buttons
- Availability toggling
- Status visualization

## Data Flow

```
User Input (text/voice/CSV)
    ↓
Report Created (raw)
    ↓
AI Parser (structured data)
    ↓
Urgency Calculator (score + level)
    ↓
Task Created (pending)
    ↓
Volunteer Matcher (top 3 suggestions)
    ↓
Task Status → Assigned
    ↓
Volunteer Actions (start/complete)
    ↓
Real-time UI Updates
```

## State Management

**Global State (Zustand):**
- `reports[]` - submitted raw reports
- `parsedReports[]` - structured data from AI
- `tasks[]` - crisis response tasks
- `volunteers[]` - volunteer database (5 defaults)
- `notifications[]` - system events

All state changes trigger UI re-renders automatically.

## UI Pages

### 1. **Dashboard** (default)
- High priority task count
- Available volunteer count
- Completed task count
- Crisis map visualization
- Notification center

### 2. **Report Page**
- Textarea input for crisis description
- Voice input button (simulates transcription)
- CSV upload button
- Live AI analysis preview showing:
  - Urgency score
  - Detected need types
  - People count
  - Keywords detected
  - Location

### 3. **Map View**
- Grid-based crisis visualization
- Interactive markers (clickable for details)
- Color-coded by urgency level
- Legend with priority levels

### 4. **Assignment Panel**
- Lists pending tasks needing assignment
- Shows matched volunteers with:
  - Name, skills, match score
  - Assign buttons
  - Match reasoning
- One-click assignment

### 5. **Volunteer Panel**
- 5 switchable volunteer profiles
- Shows assigned tasks
- Action buttons (Start/Complete)
- Availability toggle
- Task status tracking

## Default Volunteer Dataset

1. **Sarah Johnson** - Medical/Nurse skills
2. **Raj Kumar** - Construction/Shelter skills
3. **Priya Singh** - Food/Cooking/Nutrition skills
4. **Michael Chen** - Logistics/Coordination skills
5. **Emma Wilson** - Medical/Paramedic skills (initially unavailable)

## Test Scenario

1. Go to **Report** tab
2. Enter: `"10 people need urgent medical help in Bangalore"`
3. Click **Submit Report**
4. See AI output preview with:
   - Urgency: ~75/100 (high)
   - Type: medical
   - People: 10
5. Go to **Assign** tab
6. See task with matched volunteers
7. Click **Assign** on Sarah Johnson
8. Switch to **Volunteer** tab → Sarah Johnson
9. See assigned task
10. Click **Start** → task moves to in_progress
11. Click **Complete** → task marked done
12. Dashboard shows +1 completed task

## Technologies

- **React 19** with client-side state
- **Zustand** for global state management
- **Next.js 16** (App Router)
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Framer Motion** (available for animations)

## Key Features

✅ Fully functional (not a UI demo)
✅ Real logic-driven algorithms
✅ Global state synchronization
✅ Complete task lifecycle
✅ Real volunteer matching
✅ AI parsing with actual keyword detection
✅ Deterministic urgency scoring
✅ Real-time updates across all components
✅ Modular architecture (engines in `/core`)
✅ Persistent notifications system
