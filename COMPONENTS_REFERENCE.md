# 🎯 Complete Components Reference

## 📦 All New Components at a Glance

### 1. **Pagination** ⏳
**File:** `src/components/Pagination.jsx`

A smart pagination component that automatically handles page ranges.

```jsx
<Pagination
  currentPage={1}
  totalPages={10}
  onPageChange={(page) => setPage(page)}
  maxVisible={5}
/>
```

**Props:**
- `currentPage: number` - Current page number
- `totalPages: number` - Total number of pages
- `onPageChange: (page) => void` - Callback when page changes
- `maxVisible: number` - Max page buttons to show (default: 5)

**Features:**
- Smart ellipsis for skipped pages
- Disabled state for boundaries
- Animated buttons
- Shows "Page X of Y"

---

### 2. **TabBar** 📑
**File:** `src/components/TabBar.jsx`

Organize content into tabs with two style variants.

```jsx
<TabBar
  tabs={[
    { id: 'overview', label: '⚡ Overview' },
    { id: 'stats', label: '📊 Stats' },
  ]}
  activeTab={activeTab}
  onTabChange={setActiveTab}
  variant="default"  // or "pill"
/>
```

**Props:**
- `tabs: Array` - Tab objects with id and label
- `activeTab: string` - Current active tab ID
- `onTabChange: (id) => void` - Tab change callback
- `variant: 'default' | 'pill'` - Style variant

**Features:**
- Two visual styles (underline or pills)
- Animated transitions
- Staggered child animations
- Underline indicator with layoutId

---

### 3. **Breadcrumb** 🗂️
**File:** `src/components/Breadcrumb.jsx`

Navigation breadcrumb trail.

```jsx
<Breadcrumb items={[
  { id: 'hub', label: 'Hub', href: '/hub' },
  { id: 'current', label: 'Battles', active: true },
]} />
```

**Props:**
- `items: Array` - Breadcrumb items with id, label, href, active

**Features:**
- Home icon at start
- Animated appearance
- Link support
- Active state styling
- Mobile-friendly

---

### 4. **Tag** 🏷️
**File:** `src/components/Tag.jsx`

Labels and badges for categorization.

```jsx
<Tag 
  label="Featured" 
  variant="anime"
  icon={Star}
  onRemove={() => removeTag()}
/>

<TagGroup 
  tags={['Tag1', 'Tag2']}
  variant="success"
/>
```

**Props:**
- `label: string` - Tag text
- `variant: string` - Color variant
- `icon: Component` - Optional icon
- `onRemove: () => void` - Optional remove button
- `onClick: () => void` - Click handler

**Variants:** default, primary, success, warning, danger, anime

**Features:**
- 6 color variants
- Icon support
- Removable option
- Smooth animations
- TagGroup for multiple

---

### 5. **Notification** 🔔
**File:** `src/components/Notification.jsx`

Toast notifications with auto-dismiss.

```jsx
const { notifications, addNotification, removeNotification } = useNotification();

addNotification('Success!', 'success', 3000);
addNotification('Error occurred', 'error', 5000);

<NotificationContainer 
  notifications={notifications} 
  onClose={removeNotification} 
/>
```

**Types:** success, error, warning, info

**Features:**
- Auto-dismiss with timer
- Manual close button
- Animated entrance/exit
- Type-specific icons and colors
- Progress bar timer
- Stacked display

---

### 6. **ProgressBar** 📊
**File:** `src/components/ProgressBar.jsx`

Linear and circular progress indicators.

```jsx
// Linear Progress
<ProgressBar
  value={75}
  max={100}
  label="Progress"
  variant="anime"
  showPercentage={true}
/>

// Circular Progress
<CircularProgress
  value={65}
  max={100}
  label="Skills"
  size="md"
  variant="epic"
/>
```

**Props (Linear):**
- `value: number` - Current value
- `max: number` - Maximum value
- `label: string` - Label text
- `variant: string` - Color variant
- `showLabel: boolean` - Show label
- `showPercentage: boolean` - Show percentage
- `animated: boolean` - Animate on change

**Props (Circular):**
- `value, max, label, variant` - Same as linear
- `size: 'sm' | 'md' | 'lg'` - Circle size

**Features:**
- Smooth animations
- Percentage display
- 5 color variants
- Responsive sizing
- Glowing effects

---

### 7. **FluidLoader** ⚡
**File:** `src/components/FluidLoader.jsx`

Animated loading indicators.

```jsx
// Floating dots
<FluidLoader 
  size="md"
  variant="anime"
  label="Loading..."
  showLabel={true}
/>

// Circular loader
<CircularFluidLoader 
  size="lg"
  variant="default"
  label="Processing..."
/>
```

**Props:**
- `size: 'sm' | 'md' | 'lg'` - Loader size
- `variant: string` - Color theme
- `label: string` - Loading text
- `showLabel: boolean` - Show label

**Features:**
- Multiple animation styles
- Staggered dot animations
- Rotating rings (circular)
- 3 color variants
- Smooth timing

---

### 8. **ImageSlider** 🖼️
**File:** `src/components/ImageSlider.jsx`

Carousel for images or featured content.

```jsx
<ImageSlider
  images={[
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ]}
  autoPlay={true}
  autoPlayInterval={5000}
  height="h-64"
  showDots={true}
  showArrows={true}
/>
```

**Props:**
- `images: string[]` - Image URLs
- `autoPlay: boolean` - Auto-advance slides
- `autoPlayInterval: number` - Interval in ms
- `height: string` - Tailwind height class
- `showDots: boolean` - Show dot indicators
- `showArrows: boolean` - Show nav arrows

**Features:**
- Spring transitions
- Auto-play with controls
- Dot navigation
- Arrow navigation
- Dark overlay
- Responsive

---

### 9. **Slider** 🎚️
**File:** `src/components/Slider.jsx`

Range slider for numeric input.

```jsx
<Slider
  value={difficulty}
  min={1}
  max={10}
  step={1}
  onChange={(val) => setDifficulty(val)}
  label="Choose Difficulty"
  showValue={true}
  variant="anime"
/>
```

**Props:**
- `value: number` - Current value
- `min, max, step: number` - Range settings
- `onChange: (val) => void` - Change callback
- `label: string` - Label text
- `showValue: boolean` - Show current value
- `variant: string` - Color variant

**Features:**
- Smooth animations
- Value display
- Visual thumb indicator
- 5 color variants
- Custom step support

---

### 10. **GamifiedCard** 🎮
**File:** `src/components/GamifiedCard.jsx`

Cards with rarity system and gamification.

```jsx
<GamifiedCard
  title="Legendary Sword"
  subtitle="Weapon of Champions"
  icon={Sword}
  level={42}
  rarity="legendary"
  onClick={() => selectCard()}
  hoverEffect={true}
>
  <p>Amazing stats and effects</p>
</GamifiedCard>
```

**Props:**
- `title: string` - Card title
- `subtitle: string` - Card subtitle
- `icon: Component` - Icon component
- `level: number` - Display level
- `rarity: string` - Rarity level
- `onClick: () => void` - Click handler
- `hoverEffect: boolean` - Enable hover
- `children: React.ReactNode` - Card content
- `className: string` - Custom classes

**Rarities:** common, uncommon, rare, epic, legendary, mythic

**Features:**
- Rarity color coding
- Level badge
- Animated icon
- Hover effects
- Glowing corner
- Rarity indicator badge

---

### 11. **StatCard** 📈
**File:** `src/components/StatCard.jsx`

Quick stat display cards.

```jsx
<StatCard
  icon={Zap}
  label="Current Chakra"
  value={12500}
  change={15}
  suffix=" CP"
  color="purple"
/>
```

**Props:**
- `icon: Component` - Icon component
- `label: string` - Stat label
- `value: number | string` - Stat value
- `change: number` - Change percentage
- `suffix: string` - Value suffix
- `color: string` - Color variant

**Colors:** purple, green, red, yellow, blue

**Features:**
- Icon rotation animation
- Change indicator (green/red)
- Hover lift effect
- Color variants
- Responsive sizing

---

### 12. **DragonBackground** 🐉
**File:** `src/components/DragonBackground.jsx`

Animated serpent-like dragon background.

```jsx
<DragonBackground />
```

**Features:**
- Chinese serpent dragon design
- Glowing animated eyes
- Flowing body movements
- Flame breath effect
- Floating energy orbs
- Sacred dragon character (龍)
- Mouse-following glow effect
- Multiple animation layers
- Particle effects

**Visual Elements:**
- Head with eyes and horns
- Serpentine neck
- Segmented body
- Flowing tail with fins
- Decorative whiskers
- Flame effects (mouth)
- Energy orbs

**Customization:**
Edit gradient colors in DragonBackground.jsx:
```jsx
<linearGradient id="dragonGradient">
  <stop offset="0%" stopColor="#ff006e" /> {/* Pink */}
  <stop offset="25%" stopColor="#8338ec" /> {/* Purple */}
  // ... more stops
</linearGradient>
```

---

## 🎯 Quick Selection Guide

**Use When You Need To:**

| Need | Component | Example |
|------|-----------|---------|
| Navigate pages | **Pagination** | Lists, results |
| Organize sections | **TabBar** | Overview/Stats |
| Show location | **Breadcrumb** | Page hierarchy |
| Label items | **Tag** | Categories, status |
| Notify user | **Notification** | Success, error |
| Show progress | **ProgressBar** | Skills, chakra |
| Loading state | **FluidLoader** | Fetching data |
| Show images | **ImageSlider** | Events, promos |
| Numeric input | **Slider** | Settings, filters |
| Display item | **GamifiedCard** | Items, battles |
| Quick metrics | **StatCard** | Dashboard stats |
| Background | **DragonBackground** | Page backdrop |

---

## 🎨 Color Variants Reference

All components support these variants:
- `default` - Gray-blue
- `primary` - Purple-blue
- `success` - Green-emerald
- `warning` - Yellow-orange
- `danger` - Red-pink
- `anime` - Pink-purple

Some components have additional variants:
- **GamifiedCard**: common, uncommon, rare, epic, legendary, mythic
- **ProgressBar**: All 6 variants
- **StatCard**: purple, green, red, yellow, blue
- **Tag**: All 6 variants
- **FluidLoader**: default, purple, anime

---

## 📐 Sizing Guide

**Loader Sizes:**
- `sm`: 40px container
- `md`: 60px container
- `lg`: 80px container

**ProgressBar CircularProgress Sizes:**
- `sm`: 80px diameter
- `md`: 120px diameter
- `lg`: 160px diameter

**ImageSlider Heights:**
- `h-48`: 12rem (192px)
- `h-64`: 16rem (256px)
- `h-96`: 24rem (384px)

---

## 🎬 Animation Timing

Standard durations:
- **Fast**: 200-300ms (simple transitions)
- **Normal**: 300-500ms (most animations)
- **Slow**: 600-1000ms (entrance effects)

Most animations use `easeInOut` for natural feel.

---

## 📦 Import Template

```jsx
// Core components
import Pagination from '../components/Pagination';
import TabBar from '../components/TabBar';
import Breadcrumb from '../components/Breadcrumb';
import Tag, { TagGroup } from '../components/Tag';
import { NotificationContainer, useNotification } from '../components/Notification';
import ProgressBar, { CircularProgress } from '../components/ProgressBar';
import FluidLoader, { CircularFluidLoader } from '../components/FluidLoader';
import ImageSlider from '../components/ImageSlider';
import Slider from '../components/Slider';
import GamifiedCard from '../components/GamifiedCard';
import StatCard from '../components/StatCard';
import DragonBackground from '../components/DragonBackground';
```

---

## 🔧 Setup Checklist

- [x] All 12 components created
- [x] Component files in src/components/
- [x] Dragon background implemented
- [x] Notification system configured
- [x] CSS animations added
- [x] Documentation complete
- [x] Hub page example done
- [x] Integration examples provided

---

**You now have everything you need to create a fully gamified, modern anime site!** 🚀

See `GRAND_GAMIFICATION_GUIDE.md` for detailed documentation and `COMPONENTS_INTEGRATION_EXAMPLES.md` for code examples on how to use these in other pages.
