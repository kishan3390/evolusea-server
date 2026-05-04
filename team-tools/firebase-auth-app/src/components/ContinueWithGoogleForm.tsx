import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface ContinueWithGoogleFormProps {
  onUser: (token: string) => void;
  onError: (error: Error) => void;
}

export const ContinueWithGoogleForm = ({
  onUser,
  onError,
}: ContinueWithGoogleFormProps) => {
  const onClick = async () => {
    try {
      const userCredentials = await signInWithPopup(
        getAuth(),
        new GoogleAuthProvider(),
      );

      const token = await userCredentials.user.getIdToken();

      onUser(token);
    } catch (error) {
      if (error instanceof Error) {
        onError(error);
      } else {
        onError(new Error('Unknown error', { cause: error }));
      }
    }
  };
  return (
    <div className="auth-form">
      <h2>Continue with Google</h2>
      <button onClick={onClick}>Continue with Google</button>
    </div>
  );
};
