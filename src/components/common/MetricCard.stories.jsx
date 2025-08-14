import React from 'react';
import MetricCard from './MetricCard';
import { ShoppingCart } from 'lucide-react';

export default {
  title: 'Dashboard/MetricCard',
  component: MetricCard,
  args: {
    icon: ShoppingCart,
    value: '1,247',
    label: 'Toplam Talepler',
    delta: '+12.5%',
    deltaType: 'increase',
    color: '#3182ce',
    bgColor: '#ebf8ff'
  },
  argTypes: {
    deltaType: { control: 'select', options: ['increase', 'decrease', undefined] }
  }
};

export const Increase = {};
export const Decrease = { args: { delta: '-8.2%', deltaType: 'decrease', color: '#ed8936', bgColor: '#fef5e7' } };
export const Neutral = { args: { delta: undefined } };
