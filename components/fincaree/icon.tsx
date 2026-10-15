// Figma: E3iIKwdE2far5TdrPYla2z  node: 10480:39
// Page: Icon System (Collection: 8.Icons)
// Library: lucide-react
//
// This file exposes:
//   Icon        — wrapper applying the size / weight / colour tokens to any Lucide icon
//   IconSize    — size token map   (Icon/Size/XS–2XL)
//   IconWeight  — weight token map (Icon/Weight/Regular | Bold | Strong)
//   IconColor   — colour token names (Icon/* in 1.Semantic color modes)
//
// Stroke: Figma binds Icon/Weight/* to the vector stroke in px, so the stroke
// stays 1.5px at every size. Lucide scales the stroke with the icon unless
// `absoluteStrokeWidth` is on, so the wrapper turns it on by default.
//
// Accessibility: icons are decorative (aria-hidden) unless you pass `label`,
// which exposes the icon as role="img" with that name. Icon-only buttons
// should name the button instead and leave the icon decorative.

import * as React from 'react'
import { type LucideIcon, type LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Size tokens — Icon/Size/* ─────────────────────────────────────────────────

/**
 * Pixel values for each Icon/Size/* token from the 8.Icons collection.
 *
 * | Token          | px | Use                               |
 * | -------------- | --:| --------------------------------- |
 * | Icon/Size/XS   | 12 | Very compact UI, badges           |
 * | Icon/Size/SM   | 16 | Dense UI, table actions           |
 * | Icon/Size/MD   | 20 | Default UI icon                   |
 * | Icon/Size/LG   | 24 | Buttons, navigation               |
 * | Icon/Size/XL   | 32 | Feature / empty-state icons       |
 * | Icon/Size/2XL  | 40 | Large illustrations, hero states  |
 */
export const IconSize = {
  xs:   12,
  sm:   16,
  md:   20,
  lg:   24,
  xl:   32,
  '2xl': 40,
} as const satisfies Record<string, number>

export type IconSizeToken = keyof typeof IconSize

// ── Weight tokens — Icon/Weight/* ─────────────────────────────────────────────

/**
 * Stroke width (px) for each Icon/Weight/* token.
 *
 * | Token                | px  | Use                              |
 * | -------------------- | --: | -------------------------------- |
 * | Icon/Weight/Regular  | 1.5 | Default stroke width             |
 * | Icon/Weight/Bold     | 2.0 | Emphasis, active states          |
 * | Icon/Weight/Strong   | 2.5 | High contrast — XL / 2XL only    |
 */
export const IconWeight = {
  regular: 1.5,
  bold:    2.0,
  strong:  2.5,
} as const satisfies Record<string, number>

export type IconWeightToken = keyof typeof IconWeight

// ── Colour tokens — Icon/* (1.Semantic color modes) ───────────────────────────

/** Each name maps to the `.fc-icon-<name>` utility in globals.css. */
export const IconColor = {
  primary:            'Icon/Default/Primary',
  secondary:          'Icon/Default/Secondary',
  tertiary:           'Icon/Default/Tertiary',
  quaternary:         'Icon/Default/Quaternary',
  placeholder:        'Icon/Default/Placeholder',
  'placeholder-subtle': 'Icon/Default/Placeholder Subtle',
  disabled:           'Icon/Default/Disabled',
  brand:              'Icon/Brand/Primary',
  'brand-alt':        'Icon/Brand/Secondary',
  'brand-tertiary':   'Icon/Brand/Tertiary',
  'on-brand':         'Icon/On Brand/Primary',
  info:               'Icon/Status/Info',
  success:            'Icon/Status/Success',
  warning:            'Icon/Status/Warning',
  error:              'Icon/Status/Error',
  inverse:            'Icon/Inverse/Primary',
} as const

export type IconColorToken = keyof typeof IconColor

// ── Icon component ────────────────────────────────────────────────────────────

export interface IconProps extends Omit<LucideProps, 'size' | 'strokeWidth' | 'color'> {
  /** The Lucide icon component to render (e.g. `ArrowRight`, `Check`) */
  icon: LucideIcon
  /**
   * Icon/Size/* token or an explicit pixel number.
   * @default 'md' (20px)
   */
  size?: IconSizeToken | number
  /**
   * Icon/Weight/* token or an explicit stroke width in px.
   * @default 'regular' (1.5)
   */
  weight?: IconWeightToken | number
  /**
   * Icon/* colour token. Omit to inherit the surrounding text colour
   * (`currentColor`), e.g. inside a button.
   */
  color?: IconColorToken
  /**
   * Accessible name. Set it only when the icon carries meaning on its own
   * (a status with no text beside it); otherwise the icon stays hidden from
   * assistive tech.
   */
  label?: string
  /**
   * Keep the stroke at `weight` px at any size, as Figma does.
   * @default true
   */
  absoluteStrokeWidth?: boolean
  className?: string
}

export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
  (
    {
      icon: LucideIconComponent,
      size = 'md',
      weight = 'regular',
      color,
      label,
      absoluteStrokeWidth = true,
      className,
      ...props
    },
    ref
  ) => {
    const px = typeof size   === 'number' ? size   : IconSize[size]
    const sw = typeof weight === 'number' ? weight : IconWeight[weight]

    return (
      <LucideIconComponent
        ref={ref}
        size={px}
        strokeWidth={sw}
        absoluteStrokeWidth={absoluteStrokeWidth}
        className={cn('fc-icon', color && `fc-icon-${color}`, className)}
        {...(label ? { role: 'img', 'aria-label': label } : {})}
        {...props}
      />
    )
  }
)

Icon.displayName = 'Icon'

// ── Re-export lucide-react for convenience ────────────────────────────────────
// Consumers can import both the Icon wrapper and the specific icon in one line:
//   import { Icon, ArrowRight } from '@/components/fincaree/icon'
export {
  // Arrows & navigation
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  ArrowUpLeft,
  ArrowDownRight,
  ArrowDownLeft,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,

  // Actions
  Plus,
  Minus,
  X,
  Check,
  Search,
  Filter,
  SlidersHorizontal,
  RefreshCw,
  RotateCcw,
  Download,
  Upload,
  Share2,
  Copy,
  Clipboard,
  Edit2,
  Edit3,
  Pencil,
  Trash2,
  Trash,
  Save,
  Send,

  // UI controls
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Settings,
  Settings2,
  Sliders,
  MoreHorizontal,
  MoreVertical,
  Menu,
  Grid,
  List,
  LayoutGrid,
  Columns,
  Rows2,

  // Feedback / status
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Bell,
  BellOff,
  BellRing,

  // Communication
  Mail,
  MessageSquare,
  MessageCircle,
  Phone,
  PhoneCall,
  Video,
  VideoOff,

  // Users
  User,
  Users,
  UserPlus,
  UserMinus,
  UserCheck,
  UserX,

  // Files & documents
  File,
  FileText,
  FilePlus,
  FileMinus,
  FileCheck,
  FileX,
  Folder,
  FolderOpen,
  FolderPlus,

  // Finance
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  BarChart,
  BarChart2,
  BarChart3,
  LineChart,
  PieChart,
  Receipt,

  // Time
  Clock,
  Calendar,
  CalendarDays,
  CalendarCheck,
  Timer,

  // Media
  Play,
  Pause,
  Square,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Image,
  ImageOff,

  // Misc
  Link,
  Link2,
  ExternalLink,
  Globe,
  Map,
  MapPin,
  Building,
  Building2,
  Home,
  Star,
  Heart,
  Bookmark,
  Tag,
  Hash,
  AtSign,
  Zap,
  Shield,
  ShieldCheck,
  Key,
  LogIn,
  LogOut,
  Package,
  Box,
  Layers,
  Database,
  Server,
  Cloud,
  CloudUpload,
  CloudDownload,
  Wifi,
  WifiOff,
} from 'lucide-react'
