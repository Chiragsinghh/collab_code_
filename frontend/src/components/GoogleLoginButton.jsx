import { GoogleLogin } from '@react-oauth/google';
import useAuthStore from '../store/useAuthStore';

const GoogleLoginButton = () => {
  const { googleLogin } = useAuthStore();

  return (
    <GoogleLogin
      onSuccess={async (credentialResponse) => {
        await googleLogin(credentialResponse.credential);
      }}
      onError={() => {
        console.error('Google Login Failed');
      }}
      useOneTap
    />
  );
};

export default GoogleLoginButton;
