import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLazyGetUserDataQuery } from '@/features/auth/authApi';
import { useAppDispatch } from '@/app/hooks';
import { login, setUserSessionData } from '@/features/auth/authSlice';
import Loader from '@/components/loader';

export default function GoogleAuthCallback() {
  const [fetchUser] = useLazyGetUserDataQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    async function handleAuth() {
      try {
        const user = await fetchUser().unwrap();
        dispatch(login({ email: user.email }));
        dispatch(setUserSessionData(user));
        if (user.role === 'ADMIN') {
          navigate('/manage-reservations');
        } else {
          navigate('/rooms');
        }
      } catch {
        navigate('/signin', { state: { error: 'Google login failed. Please try again.' } });
      }
    }
    handleAuth();
    // eslint-disable-next-line
  }, []);

  return <Loader />;
}
