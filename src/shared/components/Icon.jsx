import React from 'react';
import * as LucideIcons from 'lucide-react';

const staticIconMap = {
  // --- Icon hệ thống cốt lõi ---
  dashboard: 'LayoutDashboard',
  tune: 'SlidersHorizontal',
  category: 'Tags',
  filter_list: 'Filter',
  chevron_left: 'ChevronLeft',
  chevron_right: 'ChevronRight',
  notifications: 'Bell',
  notifications_active: 'BellRing',
  close: 'X',
  star_outline: 'Star',
  keyboard_arrow_down: 'ChevronDown',
  expand_less: 'ChevronUp',
  expand_more: 'ChevronDown',
  keyboard_arrow_up: 'ChevronUp',
  calendar_today: 'Calendar',
  inventory_2: 'Package',
  move_to_inbox: 'Inbox',
  outbox: 'ExternalLink',
  assignment: 'ClipboardList',
  inventory: 'Boxes',
  list_alt: 'ListOrdered',
  calculate: 'Calculator',
  factory: 'Factory',
  bolt: 'Sparkles',
  input: 'ArrowDownLeft',
  output: 'ArrowUpRight',
  push_pin: 'Pin',
  delete: 'Trash2',
  sync: 'RefreshCw',
  'user-check': 'UserCheck',
  'eye-off': 'EyeOff',
  'trash-2': 'Trash2',
  save: 'Save',
  upload: 'Upload',
  settings: 'Settings',
  shopping_cart: 'ShoppingCart',
  add_shopping_cart: 'ShoppingBasket',
  shopping_bag: 'ShoppingBag',
  local_shipping: 'Truck',
  cached: 'RefreshCw',
  groups: 'Users',
  sell: 'Tag',
  campaign: 'Megaphone',
  card_giftcard: 'Gift',
  account_balance_wallet: 'Wallet',
  add: 'Plus',
  remove: 'Minus',
  south_west: 'ArrowDownLeft',
  menu_book: 'BookOpen',
  balance: 'Scale',
  assignment_add: 'ClipboardPlus',
  assignment_return: 'ClipboardMinus',
  reply: 'CornerUpLeft',
  badge: 'IdCard',
  point_of_sale: 'MonitorSmartphone',
  forum: 'MessageSquare',
  chat: 'MessageCircle',
  smart_toy: 'Bot',
  more_horiz: 'MoreHorizontal',
  assessment: 'BarChart3',
  report: 'BarChart3',
  thumb_up: 'ThumbsUp',
  thumb_down: 'ThumbsDown',
  flag: 'Flag',
  payments: 'Banknote',
  account_balance: 'Landmark',
  qr_code_2: 'QrCode',
  qr_code_scanner: 'ScanQrCode',
  credit_card: 'CreditCard',
  add_circle: 'PlusCircle',
  person: 'User',
  barcode: 'ScanBarcode',
  check_circle: 'CheckCircle2',
  chat_bubble: 'MessageSquare',

  arrow_drop_down: 'ChevronDown',
  arrow_drop_up: 'ChevronUp',
  gpp_maybe: 'ShieldAlert',
  error: 'AlertOctagon',
  warning: 'AlertTriangle',
  dangerous: 'XCircle',
  history: 'History',
  policy: 'ScrollText',
  check: 'Check',
  north_east: 'ArrowUpRight',
  swap_horiz: 'ArrowLeftRight',
  barcode_scanner: 'ScanBarcode',
  createdTime: 'Clock',
  estimatedStockOut: 'CalendarClock',
  upload_file: 'UploadCloud',
  info: 'Info',
  location_on: 'MapPin',
  request_quote: 'FileSignature',
  star: 'Star',
  store: 'Store',
  unfold_more: 'ChevronsUpDown',
  chevron_down: 'ChevronDown',
  more_horizontal: 'MoreHorizontal',
  copy: 'Copy',
  download: 'Download',
  edit: 'Pencil',
  logout: 'LogOut',
  image: 'Image',
  search: 'Search',
  send: 'Send',
  swap_vert: 'ChevronsUpDown',
  visibility: 'Eye',
  visibility_off: 'EyeOff',
  bookmark: 'Bookmark',
  new_releases: 'Sparkles',
  show_chart: 'TrendingUp',
  arrow_forward: 'ArrowRight',
  clock: 'Clock',
  gavel: 'Gavel',
  lightbulb: 'Lightbulb',
  local_fire_department: 'Flame',
  psychology: 'Brain',
  shield: 'Shield',
  trending_up: 'TrendingUp',
  update: 'RefreshCw',
  verified_user: 'BadgeCheck',
  workspace_premium: 'Crown',
  schedule: 'Clock',
  description: 'FileText',
  pause_circle: 'PauseCircle',
  play_arrow: 'Play',
  receipt: 'Receipt',
  receipt_long: 'FileText',
  access_time: 'Clock',
  note: 'FileText',
  light_mode: 'Sun',
  dark_mode: 'Moon',
};

const toPascalCase = (str) => {
  if (!str) return '';
  return str
    .split(/[_-]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const Icon = ({ name, className = '', size = 20, strokeWidth = 2, ...props }) => {
  if (!name) return null;

  let lucideName = staticIconMap[name];

  // Nếu không tìm thấy trong static map, thử convert PascalCase tự động
  if (!lucideName) {
    lucideName = toPascalCase(name);
  }

  let SelectedIcon = LucideIcons[lucideName];

  // Hỗ trợ loại bỏ hậu tố đuôi nếu có lỗi chuỗi
  if (!SelectedIcon) {
    const simplifiedName = toPascalCase(name.replace('_file', ''));
    SelectedIcon = LucideIcons[simplifiedName] || LucideIcons['HelpCircle'];
  }

  return <SelectedIcon className={className} size={size} strokeWidth={strokeWidth} {...props} />;
};

export default Icon;
