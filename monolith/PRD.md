# Planning Guide

A warm and stylish personal bookstore website that showcases curated books with a gentle, inviting atmosphere where visitors can browse books, view detailed information, and learn about the store.

**Experience Qualities**:
1. **Warm & Inviting** - The site should feel like stepping into a cozy independent bookstore with soft colors and gentle interactions
2. **Elegant & Refined** - Clean typography and thoughtful spacing that respects the literary nature of books
3. **Approachable & Friendly** - Easy to navigate with clear information hierarchy that welcomes all visitors

**Complexity Level**: Light Application (multiple features with basic state)
  - Multiple pages with navigation, filtering capabilities, state management for browsing books, and an admin interface for managing book inventory

## Essential Features

### Shopping Cart & Checkout System
- **Functionality**: Complete e-commerce flow allowing customers to add books to cart, review their order, enter payment information, and complete purchase
- **Purpose**: Enable visitors to purchase books directly through the website with a seamless checkout experience
- **Trigger**: Clicking "カートへ" button on book cards or "カートに追加" on book detail pages
- **Progression**: Browse books → Add to cart → View cart summary → Adjust quantities → Proceed to checkout → Enter shipping info → Enter payment details → Complete order → View confirmation
- **Success criteria**: Cart persists between sessions, quantities can be adjusted, only available books can be purchased, payment validation works, order confirmation displays correctly, cart clears after successful purchase

### Admin Management Interface
- **Functionality**: Allow site owners to add, edit, and delete books in the catalog with a dedicated admin interface
- **Purpose**: Enable dynamic content management without code changes
- **Trigger**: Clicking "管理" (Admin) button in navigation
- **Progression**: Click admin nav → View book list → Click "新規登録" for new book OR edit/delete existing book → Fill form with book details → Save changes → Return to admin list or catalog
- **Success criteria**: Books persist between sessions, form validation works, changes reflect immediately in catalog, delete confirmation prevents accidental removal

### Book Catalog Display
- **Functionality**: Display all available books in a grid of cards showing cover, title, status, and tags
- **Purpose**: Allow visitors to browse the bookstore's collection at a glance
- **Trigger**: Landing on the homepage or clicking "Books" navigation
- **Progression**: View grid → Scan available books → Notice status/tags → Select filter (optional) → Click card → Navigate to detail
- **Success criteria**: All books display clearly with readable information, filters work accurately, smooth navigation to details

### Book Filtering System
- **Functionality**: Filter books by sales status (Available, Coming Soon, Sold Out) and tags (genres/categories)
- **Purpose**: Help visitors find books matching their interests quickly
- **Trigger**: Clicking filter buttons or tag selections
- **Progression**: View all books → Click filter option → See filtered results → Clear filter to see all again
- **Success criteria**: Filters apply instantly, multiple filters can work together, clear visual feedback on active filters

### Book Detail View
- **Functionality**: Show comprehensive information about a selected book including full description, images, status, and tags
- **Purpose**: Provide all necessary information for visitors to learn about a book
- **Trigger**: Clicking a book card from the catalog
- **Progression**: Click book card → Navigate to detail page → Read full information → Return to catalog (back button)
- **Success criteria**: All book information displays clearly, images are prominent, navigation back to catalog is intuitive

### About Us Page
- **Functionality**: Share the story of Demo-Create team and bookstore history
- **Purpose**: Build connection and trust with visitors by sharing the store's story
- **Trigger**: Clicking "About" in navigation
- **Progression**: Click About link → Read team information → View history timeline → Navigate to other pages
- **Success criteria**: Information is engaging and readable, history is presented chronally, navigation to other pages is clear

## Edge Case Handling
- **No books match filters**: Display friendly message encouraging visitors to clear filters or browse all books
- **Missing book images**: Show placeholder with book icon to maintain layout integrity
- **Empty catalog**: Display welcoming message for visitors (though seed data prevents this)
- **Direct URL to non-existent book**: Redirect to catalog with toast notification
- **Multiple quick filter clicks**: Debounce/handle gracefully without UI jank
- **Empty shopping cart**: Show friendly empty state with call-to-action to browse books
- **Invalid payment information**: Display clear validation messages for each field
- **Out of stock items**: Prevent adding sold-out books to cart, show appropriate status
- **Cart persistence**: Cart maintains state across page refreshes using useKV
- **Order history**: Completed orders are stored and can be referenced by order ID

## Design Direction

The design should evoke warmth, literary sophistication, and approachability - like a well-curated independent bookstore. Minimal interface with generous white space allows book covers and content to shine, while soft rounded corners and gentle shadows create an inviting atmosphere.

## Color Selection

Analogous warm palette centered around soft earth tones that evoke paper, wood, and cozy reading spaces.

- **Primary Color**: Warm terracotta/clay `oklch(0.55 0.12 35)` - Represents warmth and earthiness of a physical bookstore
- **Secondary Colors**: Soft cream `oklch(0.95 0.02 85)` for cards/backgrounds, muted sage `oklch(0.65 0.08 155)` for accents
- **Accent Color**: Soft coral `oklch(0.68 0.15 35)` for call-to-action elements and active states
- **Foreground/Background Pairings**:
  - Background (Cream #F9F7F4 `oklch(0.97 0.01 85)`): Dark brown text `oklch(0.25 0.02 35)` - Ratio 12.8:1 ✓
  - Card (Warm white `oklch(0.98 0.005 85)`): Dark brown text `oklch(0.25 0.02 35)` - Ratio 13.5:1 ✓
  - Primary (Terracotta `oklch(0.55 0.12 35)`): White text `oklch(0.99 0 0)` - Ratio 5.2:1 ✓
  - Secondary (Light sage `oklch(0.92 0.03 155)`): Dark text `oklch(0.25 0.02 35)` - Ratio 11.8:1 ✓
  - Accent (Soft coral `oklch(0.68 0.15 35)`): White text `oklch(0.99 0 0)` - Ratio 4.6:1 ✓
  - Muted (Warm gray `oklch(0.88 0.01 85)`): Medium text `oklch(0.45 0.02 35)` - Ratio 5.8:1 ✓

## Font Selection

Typography should convey literary elegance with excellent readability - combining a sophisticated serif for headings with a clean sans-serif for body text to balance traditional bookstore charm with modern usability.

- **Typographic Hierarchy**:
  - H1 (Page titles): Crimson Pro SemiBold/36px/tight (-0.02em) - Literary elegance
  - H2 (Section headings): Crimson Pro SemiBold/28px/tight (-0.01em)
  - H3 (Card titles): Crimson Pro SemiBold/20px/normal
  - Body (Descriptions): Inter Regular/16px/relaxed (1.6) - Comfortable reading
  - Small (Tags, metadata): Inter Medium/14px/normal - Clear labeling
  - Button text: Inter SemiBold/15px/normal - Clear actions

## Animations

Gentle, book-page-inspired animations that feel organic and calming - nothing jarring or mechanical. Subtle fade-ins and soft hover effects create a sense of quiet interactivity.

- **Purposeful Meaning**: Soft transitions mirror the gentle experience of browsing physical books - no harsh movements
- **Hierarchy of Movement**: Book cards receive subtle lift on hover, filters fade smoothly, page transitions are gentle cross-fades

## Component Selection

- **Components**: 
  - `Card` for book displays with custom soft shadows and rounded corners (radius-lg)
  - `Badge` for status indicators and tags with custom color variants
  - `Button` for navigation and filters with ghost/outline variants
  - `Separator` for visual section breaks
  - `ScrollArea` for filtered results if needed
  - `Input` for form fields in checkout with proper labels
  - `Label` for accessible form field labels
  - Navigation bar using simple flex layout with cart badge indicator
  
- **Customizations**: 
  - Book cards with custom hover states (subtle scale and shadow increase) and inline "カートへ" buttons
  - Status badges with semantic colors (green for available, blue for coming soon, gray for sold out)
  - Custom tag badges with warm color scheme
  - Filter buttons with active state indicators
  - Cart badge in navigation showing total item count
  - Quantity selectors with +/- buttons in cart and detail pages
  - Multi-step checkout form with validation
  
- **States**: 
  - Cards: default, hover (lift + shadow), active (pressed state)
  - Filters: inactive (outline), active (filled with accent color)
  - Images: loading skeleton, loaded with fade-in, error with book icon placeholder
  - Cart button: enabled for available books, hidden for sold out/coming soon
  - Checkout form: pristine, validating, processing, success
  - Payment processing: loading state during simulated transaction
  
- **Icon Selection**: 
  - `Book` for empty states and placeholders
  - `ArrowLeft` for back navigation
  - `FunnelSimple` for filter interface
  - `Tag` for tag indicators
  - `X` for clearing filters
  - `ShoppingCart` for cart buttons and navigation
  - `Plus`/`Minus` for quantity controls
  - `Trash` for removing items from cart
  - `CreditCard` for payment section
  - `Lock` for secure payment indicator
  - `CheckCircle` for order confirmation
  - `Package` for order items section
  - `EnvelopeSimple` for email notifications
  
- **Spacing**: 
  - Container max-width: 1200px with padding-x of 6 (24px)
  - Card grid gap: 6 (24px)
  - Section spacing: 12 (48px) between major sections
  - Card internal padding: 5 (20px)
  - Form field spacing: 4 (16px) between fields
  - Checkout layout: 2-column grid with sidebar summary
  
- **Mobile**: 
  - Single column card layout on mobile (<768px)
  - Two columns on tablet (768-1024px)
  - Three columns on desktop (>1024px)
  - Sticky navigation bar with responsive cart badge
  - Filter panel transforms to drawer/sheet on mobile
  - Touch-friendly tap targets (min 44px)
  - Single column checkout form on mobile
  - Cart items stack vertically on small screens
