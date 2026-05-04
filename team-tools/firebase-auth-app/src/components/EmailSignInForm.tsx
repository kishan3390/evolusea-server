import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { useState, type FormEvent } from 'react';

interface EmailSignInFormProps {
  onUser: (token: string) => void;
  onError: (error: Error) => void;
}

export const EmailSignInForm = ({ onUser, onError }: EmailSignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const auth = getAuth();

    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      const token = await user.getIdToken();

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
    <form className="auth-form" onSubmit={onSubmit}>
      <h2>Sign in with email</h2>
      <input
        type="email"
        placeholder="Email"
        onChange={(event) => setEmail(event.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(event) => setPassword(event.target.value)}
      />
      <button type="submit">Sign in</button>
    </form>
  );
};
