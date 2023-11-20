import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/use-auth.tsx';

export function SignIn() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const executeSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = await auth.signIn(username, password);
    console.log("auth.signIn", result, auth);
    if (result.success) {
      const con = await auth.currentCredentials();
      console.log("auth.currentCredentials", con);
      //const credentials = await Auth.currentCredentials() // Cognito サインイン済みと仮定
      const credentials = {};
      navigate({ pathname: '/dashboard', credentials });
    } else {
      alert(result.message);
    }
  };

  return (
    <form noValidate onSubmit={executeSignIn}>
      <div>
        <label htmlFor="username">メールアドレス: </label>
        <input
          id="username"
          type="email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="password">パスワード: </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button type="submit">ログイン</button>
    </form>
  );
}
