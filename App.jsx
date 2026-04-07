import { useState, useEffect } from "react";
import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  collection,
  addDoc,
  getDocs,
  setDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [regNo, setRegNo] = useState("");

  const [user, setUser] = useState(null);
  const [userReg, setUserReg] = useState("");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");

  const [commentText, setCommentText] = useState("");

  // 💬 CHAT
  const [chatOpen, setChatOpen] = useState(false);
  const [currentChat, setCurrentChat] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  // ✅ COLLEGE EMAIL CHECK
  const isCollegeEmail = (mail) =>
    mail.trim().toLowerCase().endsWith("@psnacet.edu.in");

  // 🔐 SIGNUP
  const signup = async () => {
    if (!isCollegeEmail(email)) {
      alert("Only college mail allowed");
      return;
    }

    const res = await createUserWithEmailAndPassword(auth, email, password);
    setUser(res.user);

    await setDoc(doc(db, "users", res.user.uid), {
      regNo,
    });

    setUserReg(regNo);
  };

  // 🔐 LOGIN
  const login = async () => {
    if (!isCollegeEmail(email)) {
      alert("Use college mail only");
      return;
    }

    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(res.user);

    const docRef = await getDoc(doc(db, "users", res.user.uid));
    if (docRef.exists()) {
      setUserReg(docRef.data().regNo);
    }

    loadProducts();
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ➕ ADD PRODUCT
  const addProduct = async () => {
    await addDoc(collection(db, "products"), {
      name: productName,
      price,
      desc,
      image,
      regNo: userReg,
      comments: [],
    });

    setShowForm(false);
    loadProducts();
  };

  // 🗑 DELETE
  const deleteProduct = async (id, owner) => {
    if (owner !== userReg) return alert("Not allowed");
    await deleteDoc(doc(db, "products", id));
    loadProducts();
  };

  // 💬 COMMENT
  const addComment = async (id, old) => {
    if (!commentText) return;

    await updateDoc(doc(db, "products", id), {
      comments: [...(old || []), `${userReg}: ${commentText}`],
    });

    setCommentText("");
    loadProducts();
  };

  // 💬 CHAT SEND
  const sendMessage = async () => {
    if (!message) return;

    await addDoc(collection(db, "chats"), {
      chatId: currentChat.id,
      sender: userReg,
      text: message,
      time: Date.now(),
    });

    setMessage("");
  };

  // 💬 CHAT LISTENER
  useEffect(() => {
    if (!currentChat) return;

    const unsub = onSnapshot(collection(db, "chats"), (snap) => {
      let list = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.chatId === currentChat.id) {
          list.push(data);
        }
      });
      setMessages(list);
    });

    return () => unsub();
  }, [currentChat]);

  // 📦 LOAD PRODUCTS
  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    let list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setProducts(list.reverse());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🔐 LOGIN UI
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>🔥 Greetax</h2>

        <input placeholder="College Email" onChange={(e) => setEmail(e.target.value)} /><br /><br />
        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} /><br /><br />
        <input placeholder="Register No (25EE073)" onChange={(e) => setRegNo(e.target.value)} /><br /><br />

        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "10px" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
        <h2>🔥 Greetax</h2>

        <input placeholder="Search..." onChange={(e) => setSearch(e.target.value)} />

        <div>
          <button onClick={() => setShowForm(true)}>+ Sell</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* ADD PRODUCT */}
      {showForm && (
        <div style={{ background: "#eee", padding: "10px", margin: "20px" }}>
          <input placeholder="Name" onChange={(e) => setProductName(e.target.value)} /><br />
          <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} /><br />
          <textarea placeholder="Description" onChange={(e) => setDesc(e.target.value)} /><br />
          <input placeholder="Image URL" onChange={(e) => setImage(e.target.value)} /><br />

          <button onClick={addProduct}>Post</button>
        </div>
      )}

      {/* FEED */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
        gap: "10px"
      }}>
        {filtered.map((p) => (
          <div key={p.id} style={{ border: "1px solid #ccc", padding: "10px" }}>
            {p.image && <img src={p.image} style={{ width: "100%" }} />}

            <h3>{p.name}</h3>
            <p>₹ {p.price}</p>
            <p>{p.desc}</p>
            <small>👤 {p.regNo}</small>

            <button onClick={() => {
              setChatOpen(true);
              setCurrentChat(p);
            }}>
              💬 Chat
            </button>

            {p.regNo === userReg && (
              <button onClick={() => deleteProduct(p.id, p.regNo)}>
                🗑 Delete
              </button>
            )}

            {/* COMMENTS */}
            <div>
              <input placeholder="Comment..." onChange={(e) => setCommentText(e.target.value)} />
              <button onClick={() => addComment(p.id, p.comments)}>Send</button>

              {p.comments?.map((c, i) => (
                <p key={i}>💬 {c}</p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CHAT BOX */}
      {chatOpen && (
        <div style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "300px",
          background: "white",
          padding: "10px"
        }}>
          <h4>Chat</h4>

          <div style={{ height: "200px", overflow: "auto" }}>
            {messages.map((m, i) => (
              <p key={i}><b>{m.sender}:</b> {m.text}</p>
            ))}
          </div>

          <input value={message} onChange={(e) => setMessage(e.target.value)} />
          <button onClick={sendMessage}>Send</button>
          <button onClick={() => setChatOpen(false)}>Close</button>
        </div>
      )}
    </div>
  );
}