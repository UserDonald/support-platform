import { CONTACT_SESSION_KEY } from '@/modules/widget/constants';
import { WidgetScreen } from '@/modules/widget/types';
import { Id } from '@workspace/backend/_generated/dataModel';
import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';

export const screenAtom = atom<WidgetScreen>('loading');
export const organizationIdAtom = atom<string | null>(null);
export const contactSessionIdAtomFamily = atomFamily((organizationId: string) =>
  atomWithStorage<Id<'contactSessions'> | null>(
    `${CONTACT_SESSION_KEY}_${organizationId}`,
    null
  )
);
export const errorMessageAtom = atom<string | null>(null);
export const loadingMessageAtom = atom<string | null>(null);
export const conversationIdAtom = atom<Id<'conversations'> | null>(null);
