# Frontend — nuScenes Data Inspector

React + TypeScript single-page application for exploring the nuScenes dataset.

## Tech Stack

- **Framework**: React 19, Vite 8, TypeScript (strict)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Radix primitives)
- **Icons**: [lucide-react](https://lucide.dev/)
- **Styling**: Tailwind CSS v4
- **3D Visualization**: Three.js via React Three Fiber + Drei
- **Server State**: TanStack Query
- **Client State**: Zustand

## Setup

```bash
npm install
npm run dev
```

The Vite dev server starts on `http://localhost:5173` and proxies `/api` requests to the backend on port 8000.

## Project Structure

```
src/
  main.tsx              # Entry point, providers (Query, Tooltip)
  App.tsx               # Root component, layout orchestration
  index.css             # Tailwind imports + dark theme tokens
  api/client.ts         # Typed fetch wrapper
  lib/utils.ts          # cn() class-merge utility (shadcn/ui)
  hooks/                # TanStack Query hooks
  store/useAppStore.ts  # Zustand global UI state
  types/api.ts          # TypeScript interfaces mirroring backend schemas
  components/
    ui/                 # shadcn/ui primitives (auto-generated)
      button.tsx        badge.tsx        skeleton.tsx
      popover.tsx       scroll-area.tsx  slider.tsx
      tooltip.tsx       card.tsx         sheet.tsx
    Layout.tsx          # Responsive shell (Sheet sidebar on mobile)
    SceneSelector.tsx   # Scene list with ScrollArea + Skeleton loading
    FrameNavigator.tsx  # Prev/Next Buttons, Slider, Tooltips
    CameraGrid.tsx      # 6-camera grid with Card wrappers
    LidarViewer.tsx     # Three.js point cloud (isolated rendering)
    QualityBadge.tsx    # Status Badge with Popover detail panel
    ErrorBoundary.tsx   # Class-based error catch with retry
components.json         # shadcn/ui configuration
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components are installed into `src/components/ui/` and use the `@/` path alias.
