import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

const signInWithPassword = vi.fn();
const signUp = vi.fn();
const signOut = vi.fn();
const getSession = vi.fn();
const unsubscribe = vi.fn();
let clientAvailable = true;

vi.mock("@/integrations/supabase/client", () => ({
  getSupabaseClient: () =>
    clientAvailable
      ? {
          auth: {
            getSession,
            signInWithPassword,
            signUp,
            signOut,
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe } } }),
          },
        }
      : null,
}));

import { AuthProvider } from "@/auth/AuthProvider";
import { useAuth } from "@/auth/useAuth";
import { validateRegister, validateLogin } from "@/auth/validation";

const TEST_EMAIL = "user@example.test";
const TEST_SECRET = "not-a-real-password";

function Probe() {
  const { user, loading, isAuthAvailable, signIn, signOut: doSignOut } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user?.email ?? "none"}</span>
      <span data-testid="available">{String(isAuthAvailable)}</span>
      <span data-testid="error">{error ?? ""}</span>
      <button onClick={async () => setError((await signIn(TEST_EMAIL, TEST_SECRET)).error)}>
        signin
      </button>
      <button onClick={async () => setError((await doSignOut()).error)}>signout</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

describe("AuthProvider", () => {
  beforeEach(() => {
    clientAvailable = true;
    vi.clearAllMocks();
    getSession.mockResolvedValue({ data: { session: null } });
    signInWithPassword.mockResolvedValue({ data: {}, error: null });
    signOut.mockResolvedValue({ error: null });
  });
  afterEach(() => vi.clearAllMocks());

  it("starts loading and resolves to a no-session state", async () => {
    let resolveSession: (v: unknown) => void = () => {};
    getSession.mockReturnValue(new Promise((r) => (resolveSession = r)));
    renderProbe();
    expect(screen.getByTestId("loading").textContent).toBe("true");
    await act(async () => {
      resolveSession({ data: { session: null } });
    });
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("user").textContent).toBe("none");
  });

  it("signs in successfully", async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    await userEvent.click(screen.getByText("signin"));
    expect(signInWithPassword).toHaveBeenCalledWith({
      email: TEST_EMAIL,
      password: TEST_SECRET,
    });
    await waitFor(() => expect(screen.getByTestId("error").textContent).toBe(""));
  });

  it("maps invalid credentials to a safe error key", async () => {
    signInWithPassword.mockResolvedValue({
      data: {},
      error: { message: "Invalid login credentials" },
    });
    renderProbe();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    await userEvent.click(screen.getByText("signin"));
    await waitFor(() =>
      expect(screen.getByTestId("error").textContent).toBe("auth.invalidCredentials"),
    );
  });

  it("signs out", async () => {
    renderProbe();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    await userEvent.click(screen.getByText("signout"));
    expect(signOut).toHaveBeenCalled();
    await waitFor(() => expect(screen.getByTestId("user").textContent).toBe("none"));
  });

  it("stays safe when Supabase is unavailable", async () => {
    clientAvailable = false;
    renderProbe();
    await waitFor(() => expect(screen.getByTestId("loading").textContent).toBe("false"));
    expect(screen.getByTestId("available").textContent).toBe("false");
    await userEvent.click(screen.getByText("signin"));
    await waitFor(() => expect(screen.getByTestId("error").textContent).toBe("auth.unavailable"));
    expect(signInWithPassword).not.toHaveBeenCalled();
  });
});

describe("auth validation", () => {
  it("rejects invalid email and empty password on login", () => {
    const errors = validateLogin({ email: "nope", password: "" });
    expect(errors.email).toBe("auth.invalidEmail");
    expect(errors.password).toBe("auth.passwordRequired");
  });

  it("rejects short passwords on register", () => {
    const errors = validateRegister({ email: TEST_EMAIL, password: "abc", confirmPassword: "abc" });
    expect(errors.password).toBe("auth.passwordTooShort");
  });

  it("rejects password confirmation mismatch", () => {
    const errors = validateRegister({
      email: TEST_EMAIL,
      password: TEST_SECRET,
      confirmPassword: `${TEST_SECRET}x`,
    });
    expect(errors.confirmPassword).toBe("auth.passwordMismatch");
  });

  it("accepts a valid registration input", () => {
    expect(
      validateRegister({
        email: TEST_EMAIL,
        password: TEST_SECRET,
        confirmPassword: TEST_SECRET,
      }),
    ).toEqual({});
  });
});
