'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useAuth, type User } from '@/providers/AuthProvider';
import { updateSettingsAction } from '@/app/actions/auth';
import { avatarUrl } from '@/lib/config.utils';
import type { SectionId } from './SettingsNav';

/* eslint-disable react-hooks/set-state-in-effect */
export function useSettingsForm() {
  const { user, setUser } = useAuth();
  const [state, formAction, isPending] = useActionState(updateSettingsAction, null);
  const [activeSection, setActiveSection] = useState<SectionId>('profile');
  const [username, setUsername] = useState((user as unknown as { username?: string })?.username ?? user?.name ?? '');
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [language, setLanguage] = useState(user?.preferences?.language ?? 'en');
  const [includeAdult, setIncludeAdult] = useState(user?.preferences?.include_adult ?? false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(avatarUrl(user?.avatar) ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success && state.user) setUser(state.user as User);
  }, [state, setUser]);

  const storedUsername = (user as unknown as { username?: string })?.username;
  const storedNickname = user?.nickname;
  const storedEmail = user?.email;
  const storedLanguage = user?.preferences?.language;
  const storedIncludeAdult = user?.preferences?.include_adult;

  useEffect(() => {
    if (user) {
      setUsername(storedUsername ?? user.name ?? '');
      setNickname(user.nickname ?? '');
      setEmail(user.email ?? '');
      setLanguage(user.preferences?.language ?? 'en');
      setIncludeAdult(!!user.preferences?.include_adult);
    }
  }, [user, storedUsername, storedNickname, storedEmail, storedLanguage, storedIncludeAdult]);

  useEffect(() => {
    if (state?.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [state?.success]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAvatarPreview(avatarUrl(user?.avatar) ?? null);
    }
  }, [avatarFile, user?.avatar]);

  const scrollTo = (id: SectionId) => {
    setActiveSection(id);
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const clearAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return {
    user, state, formAction, isPending, activeSection, username, setUsername,
    nickname, setNickname, email, setEmail, currentPassword, setCurrentPassword,
    newPassword, setNewPassword, confirmPassword, setConfirmPassword,
    showPasswords, setShowPasswords, language, setLanguage, includeAdult, setIncludeAdult,
    avatarFile, setAvatarFile, avatarPreview, fileRef, scrollTo, clearAvatar,
  };
}

export type SettingsForm = ReturnType<typeof useSettingsForm>;
