import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [listName, setListName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) return navigate("/");
      setUser(u);

      const q = query(
        collection(db, "lists"),
        where("members", "array-contains", u.uid)
      );

      const unsubLists = onSnapshot(q, (snap) => {
        setLists(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      });

      return () => unsubLists();
    });

    return () => unsubAuth();
  }, [navigate]);

  const createList = async () => {
    const name = listName.trim();
    if (!name) return alert("Enter a list name");
    try {
      setCreating(true);
      await addDoc(collection(db, "lists"), {
  name,
  owner: user.uid,
  ownerEmail: user.email,         // ✅ added
  members: [user.uid],
  memberEmails: [user.email],     // ✅ added
  createdAt: serverTimestamp(),
});

      setListName("");
    } catch (e) {
      console.error(e);
      alert("Failed to create list");
    } finally {
      setCreating(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="wrap">
      <div className="topbar">
       <h2>TaskSync — My Lists</h2>
        <p>Logged in as: <b>{user?.email}</b></p>

        <div className="spacer" />
        <button onClick={logout}>Logout</button>
      </div>

      <div className="row">
        <input
          placeholder="New list name (e.g. Project Alpha)"
          value={listName}
          onChange={(e) => setListName(e.target.value)}
        />
        <button onClick={createList} disabled={creating}>
          {creating ? "Creating…" : "Create List"}
        </button>
      </div>

      {lists.length === 0 ? (
        <p className="hint">No lists yet. Create your first one ↑</p>
      ) : (
        <ul className="list">
          {lists.map((l) => (
            <li key={l.id} className="listItem">
              <div>
                <strong>{l.name}</strong>
                <div className="meta">
  Owner: {l.owner === user?.uid ? "You" : l.ownerEmail}
</div>

              </div>
              <button onClick={() => navigate(`/list/${l.id}`)}>Open</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
