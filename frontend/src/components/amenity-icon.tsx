import { Wifi, Tv, Wine, Wind, Coffee, Calendar, X, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

const AmenityIcon = ({ amenity }: { amenity: string }) => {
  const iconProps = { className: 'w-4 h-4' };
  
  switch (amenity) {
    case 'Wi-Fi':
      return <Wifi {...iconProps} />;
    case 'TV':
      return <Tv {...iconProps} />;
    case 'Mini-bar':
      return <Wine {...iconProps} />;
    case 'Air Conditioning':
      return <Wind {...iconProps} />;
    case 'Coffee Maker':
      return <Coffee {...iconProps} />;
    default:
      return null;
  }
};

export default AmenityIcon;