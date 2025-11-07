import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { query, where, getDocs } from "firebase/firestore";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { signOut } from "firebase/auth";

export default function List() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listData, setListData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskText, setTaskText] = useState("");
  const [shareEmail, setShareEmail] = useState("");
  const [shareBusy, setShareBusy] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return navigate("/");

    // Load list information
    (async () => {
      const ref = doc(db, "lists", id);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        alert("List not found");
        return navigate("/dashboard");
      }
      setListData({ id, ...snap.data() });
    })();

    // Load tasks real-time
    const unsub = onSnapshot(collection(db, "lists", id, "tasks"), (snap) => {
      setTasks(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [id, navigate]);

  const addTask = async () => {
    if (!taskText.trim()) return;
    await addDoc(collection(db, "lists", id, "tasks"), {
      text: taskText.trim(),
      done: false,
      createdAt: new Date(),
    });
    setTaskText("");
  };

  const toggleDone = async (task) => {
    const ref = doc(db, "lists", id, "tasks", task.id);
    await updateDoc(ref, { done: !task.done });
  };

  const removeTask = async (task) => {
    const shouldDelete = confirm("Are you sure you want to delete this task?");
    if (!shouldDelete) return;
    const ref = doc(db, "lists", id, "tasks", task.id);
    await deleteDoc(ref);
  };

  const shareList = async () => {
    if (!shareEmail.trim()) return;

    try {
      setShareBusy(true);

      // Find user by email
      const q = query(collection(db, "users"), where("email", "==", shareEmail));
      const snap = await getDocs(q);

      if (snap.empty) {
        alert("User not found");
        return;
      }

      const targetUid = snap.docs[0].id;

      // Update list members
      const listRef = doc(db, "lists", id);
      await updateDoc(listRef, {
        members: [...listData.members, targetUid],
        memberEmails: [...listData.memberEmails, shareEmail],
      });

      setShareEmail("");
      alert("User added successfully 🎉");
    } catch (err) {
      console.error(err);
      alert("Could not share list");
    } finally {
      setShareBusy(false);
    }
  };

  return (
    <div className="wrap">
      <div className="topbar">
        <button onClick={() => navigate("/dashboard")}>← Back</button>
        <div className="spacer" />
        <button onClick={() => { signOut(auth); navigate("/"); }}>Logout</button>
      </div>

      <h2>{listData?.name || "Loading…"}</h2>

      {/* ✅ SHOW OWNER & SHARED USERS */}
      <p><b>Owner:</b> {listData?.owner === auth.currentUser.uid ? "You" : listData?.ownerEmail}</p>

      <p><b>Shared With:</b></p>
      <ul>
        {listData?.memberEmails?.map((email, i) =>
          email !== listData.ownerEmail && <li key={i}>{email}</li>
        )}
      </ul>
      {/* ✅ END */}

      <div className="row">
        <input
          value={taskText}
          placeholder="New task…"
          onChange={(e) => setTaskText(e.target.value)}
        />
        <button onClick={addTask}>Add</button>
      </div>

      <h3>Share This List</h3>
      <div className="row">
        <input
          placeholder="Enter email to share"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
        />
        <button onClick={shareList} disabled={shareBusy}>
          {shareBusy ? "Sharing..." : "Share"}
        </button>
      </div>

      <ul className="list">
        {tasks.map((t) => (
          <li key={t.id} className="listItem">
            <div
              className={`task ${t.done ? "done" : ""}`}
              onClick={() => toggleDone(t)}
              title="Click to mark done / undo"
            >
              {t.text}
            </div>

            {/* ✅ Delete Button with style */}
            <button
              onClick={() => removeTask(t)}
              style={{
                background: "red",
                color: "white",
                borderRadius: "6px",
                padding: "6px 10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Delete
            </button>

          </li>
        ))}
      </ul>
    </div>
  );
}
