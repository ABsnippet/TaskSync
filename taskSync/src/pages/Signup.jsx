import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const signup = async () => {
  if (!email || !password) return alert("Enter email & password");
  try {
    setBusy(true);
    const res = await createUserWithEmailAndPassword(auth, email, password);

    // ✅ Save user email -> uid map
    await setDoc(doc(db, "users", res.user.uid), {
      email: email,
    });

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
        <h2>TaskSync – Signup</h2>
        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Password (min 6)"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={signup} disabled={busy}>
          {busy ? "Creating…" : "Create Account"}
        </button>
        <p>
          Have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}
