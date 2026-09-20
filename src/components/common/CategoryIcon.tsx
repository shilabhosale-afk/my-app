import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  MoreHorizontal,
  Briefcase,
  Laptop,
  TrendingUp,
  PiggyBank,
  Tag,
  Home,
  Coffee,
  Plane,
  Gift,
  HelpCircle,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4', ...props }) => {
  switch (name?.toLowerCase()) {
    case 'utensils':
    case 'food':
      return <Utensils className={className} {...props} />;
    case 'car':
    case 'transport':
      return <Car className={className} {...props} />;
    case 'shoppingbag':
    case 'shopping':
      return <ShoppingBag className={className} {...props} />;
    case 'receipt':
    case 'bills':
      return <Receipt className={className} {...props} />;
    case 'film':
    case 'entertainment':
      return <Film className={className} {...props} />;
    case 'heartpulse':
    case 'health':
      return <HeartPulse className={className} {...props} />;
    case 'briefcase':
    case 'salary':
      return <Briefcase className={className} {...props} />;
    case 'laptop':
    case 'freelance':
      return <Laptop className={className} {...props} />;
    case 'trendingup':
    case 'investments':
      return <TrendingUp className={className} {...props} />;
    case 'piggybank':
      return <PiggyBank className={className} {...props} />;
    case 'home':
      return <Home className={className} {...props} />;
    case 'coffee':
      return <Coffee className={className} {...props} />;
    case 'plane':
      return <Plane className={className} {...props} />;
    case 'gift':
      return <Gift className={className} {...props} />;
    case 'morehorizontal':
    case 'other':
      return <MoreHorizontal className={className} {...props} />;
    default:
      return <Tag className={className} {...props} />;
  }
};
