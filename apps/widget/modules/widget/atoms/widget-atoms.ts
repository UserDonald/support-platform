import { WidgetScreen } from '@/modules/widget/types';
import { atom } from 'jotai';

// Basic widget state atoms
export const screenAtom = atom<WidgetScreen>('auth');
