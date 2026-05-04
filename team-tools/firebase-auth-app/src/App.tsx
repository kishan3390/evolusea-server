import { useState } from 'react';
import './App.css';
import './firebase.ts';

import {
  ContinueWithGoogleForm,
  EmailSignInForm,
  EmailSignUpForm,
  ErrorContainer,
  TokenContainer,
} from './components';

function App() {
  const [error, setError] = useState<Error | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const onUser = (token: string) => {
    setToken(token);
    setError(null);
  };
  const onError = (error: Error) => {
    setToken(null);
    setError(error);
  };

  return (
    <div className="App">
      <div className="auth-container">
        <EmailSignInForm onUser={onUser} onError={onError} />
        <EmailSignUpForm onUser={onUser} onError={onError} />
        <ContinueWithGoogleForm onUser={onUser} onError={onError} />
      </div>

      <div className="display-container">
        {error && <ErrorContainer error={error} />}
        {token && <TokenContainer token={token} />}
      </div>
    </div>
  );
}

export default App;
