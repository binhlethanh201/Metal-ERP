import React from 'react';
import * as LucideIcons from 'lucide-react';

const staticIconMap = {
  dashboard: 'LayoutDashboard',
  tune: 'SlidersHorizontal',
  filter_list: 'Filter',
  chevron_left: 'ChevronLeft',
  chevron_right: 'ChevronRight',
  notifications: 'Bell',
  notifications_active: 'BellRing',
  close: 'X',
  star_outline: 'Star',
  keyboard_arrow_down: 'ChevronDown',
  expand_more: 'ChevronDown',
  keyboard_arrow_up: 'ChevronUp',
  calendar_today: 'Calendar',
  inventory_2: 'Package',
  move_to_inbox: 'Inbox',
  outbox: 'ExternalLink',
  swap_horiz: 'ArrowLeftRight',
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
  south_west: 'ArrowDownLeft',
  north_east: 'ArrowUpRight',
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
  add: 'Plus',
  payments: 'Banknote',
  account_balance: 'Landmark',
  qr_code_2: 'QrCode',
  credit_card: 'CreditCard',
};

const toPascalCase = (str) => {
  if (!str) return '';
  return str
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
};

const Icon = ({ name, className = '', size = 20, strokeWidth = 2, ...props }) => {
  if (!name) return null;

  let lucideName = staticIconMap[name];

  if (!lucideName) {
    lucideName = toPascalCase(name);
  }

  let SelectedIcon = LucideIcons[lucideName];

  if (!SelectedIcon) {
    const simplifiedName = toPascalCase(name.replace('_file', ''));
    SelectedIcon = LucideIcons[simplifiedName] || LucideIcons['HelpCircle'];
  }

  return <SelectedIcon className={className} size={size} strokeWidth={strokeWidth} {...props} />;
};

export default Icon;
