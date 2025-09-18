import React from 'react';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface TabBarIconProps {
  route: any;
  focused: boolean;
  color: string;
  size: number;
}

const TabBarIcon: React.FC<TabBarIconProps> = ({ route, focused, color, size }) => {
  let iconName: string;

  switch (route.name) {
    case 'Home':
      iconName = 'home';
      break;
    case 'ShadeFinder':
      iconName = 'palette';
      break;
    case 'Matches':
      iconName = 'heart';
      break;
    case 'Favorites':
      iconName = 'star';
      break;
    case 'Profile':
      iconName = 'account';
      break;
    default:
      iconName = 'circle';
  }

  return <Icon name={iconName} size={size} color={color} />;
};

export default TabBarIcon; 