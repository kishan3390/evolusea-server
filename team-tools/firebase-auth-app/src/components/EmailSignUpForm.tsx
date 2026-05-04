import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import { useState, type FormEvent } from 'react';

interface EmailSignUpFormProps {
  onUser: (token: string) => void;
  onError: (error: Error) => void;
}

export const EmailSignUpForm = ({ onUser, onError }: EmailSignUpFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const auth = getAuth();

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
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
      <h2>Register with email</h2>
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
      <button type="submit">Register</button>
    </form>
  );
};
