import React from 'react';
import {
  BookOpen,
  Shield,
  Compass,
  Heart,
  Feather,
  Users,
  Sparkles,
  Smile,
  Globe,
  Moon,
  MapPin,
  MessageSquare,
  Calendar,
  Scroll,
  Clock,
  GraduationCap,
  Home,
  Layers,
  Share2,
  Video,
  Mic,
  Search,
  Check,
  Bookmark,
  Sun,
  Printer,
  ChevronDown,
  X,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  HelpCircle,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name.toLowerCase()) {
    case 'bookopen':
      return <BookOpen className={className} />;
    case 'shield':
      return <Shield className={className} />;
    case 'compass':
      return <Compass className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'feather':
      return <Feather className={className} />;
    case 'users':
      return <Users className={className} />;
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'smile':
      return <Smile className={className} />;
    case 'globe':
      return <Globe className={className} />;
    case 'moon':
      return <Moon className={className} />;
    case 'mappin':
      return <MapPin className={className} />;
    case 'messagesquare':
      return <MessageSquare className={className} />;
    case 'calendar':
      return <Calendar className={className} />;
    case 'scroll':
      return <Scroll className={className} />;
    case 'clock':
      return <Clock className={className} />;
    case 'graduationcap':
      return <GraduationCap className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'layers':
      return <Layers className={className} />;
    case 'share2':
      return <Share2 className={className} />;
    case 'video':
      return <Video className={className} />;
    case 'mic':
      return <Mic className={className} />;
    case 'search':
      return <Search className={className} />;
    case 'bookmark':
      return <Bookmark className={className} />;
    case 'sun':
      return <Sun className={className} />;
    case 'printer':
      return <Printer className={className} />;
    case 'filetext':
      return <FileText className={className} />;
    case 'slidershorizontal':
      return <SlidersHorizontal className={className} />;
    case 'check':
      return <Check className={className} />;
    case 'copy':
      return <Copy className={className} />;
    case 'x':
      return <X className={className} />;
    default:
      return <HelpCircle className={className} />;
  }
};
