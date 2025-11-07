import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const login = async () => {
    if (!email || !password) return alert("Enter email & password");
    try {
      setBusy(true);
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="wrap">
      <div className="card">
        <h2>TaskSync – Login</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={login} disabled={busy}>
          {busy ? "Signing in…" : "Login"}
        </button>
        <p>
          No account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </div>
  );
}
