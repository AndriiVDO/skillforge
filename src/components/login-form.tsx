"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/app/login/actions";

export function LoginForm() {
  const initialState: LoginState = { error: "" };

  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="panel topic-form">
      <div className="form-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="username"
          defaultValue={state.email}
          maxLength={256}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          maxLength={1024}
          required
        />
      </div>

      {state.error && (
        <p className="error-message" role="alert">
          {state.error}
        </p>
      )}

      <div className="form-actions">
        <button
          type="submit"
          className="button button-primary"
          disabled={pending}
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </div>
    </form>
  );
}
