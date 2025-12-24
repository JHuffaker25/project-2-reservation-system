import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { setTheme } from '@/features/theme/themeSlice';

export function useSyncThemeWithUser() {
  const dispatch = useAppDispatch();
  const userPreferences = useAppSelector((state) => state.auth.user?.preferences);

  useEffect(() => {
    if (typeof userPreferences?.darkMode === 'boolean') {
      dispatch(setTheme(userPreferences.darkMode ? 'dark' : 'light'));
    }
  }, [userPreferences, dispatch]);
}
