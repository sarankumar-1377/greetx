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
  updateDoc,
  doc,
} from "firebase/firestore";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");

  const [comment, setComment] = useState("");
  const [dark, setDark] = useState(false);

  // 🔐 LOGIN
  const login = async () => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(res.user);
  };

  // 🔐 SIGNUP
  const signup = async () => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    setUser(res.user);
  };

  // 📦 LOAD PRODUCTS
  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    let list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setProducts(list.reverse());
  };

  useEffect(() => {
    if (user) loadProducts();
  }, [user]);

  // ➕ ADD PRODUCT (🔥 FIXED)
  const addProduct = async () => {
    if (!image) return alert("Paste image URL");

    await addDoc(collection(db, "products"), {
      name: productName,
      price,
      desc,
      image,
      user: user.email,
      likes: 0,
      rating: 0,
      comments: [],
    });

    setProductName("");
    setPrice("");
    setDesc("");
    setImage("");

    // 🔥 FORCE REFRESH
    const snap = await getDocs(collection(db, "products"));
    let list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    setProducts(list.reverse());
  };

  // ❤️ LIKE
  const likeProduct = async (id, likes) => {
    await updateDoc(doc(db, "products", id), { likes: likes + 1 });
    loadProducts();
  };

  // ⭐ RATE
  const rateProduct = async (id, rating) => {
    await updateDoc(doc(db, "products", id), { rating });
    loadProducts();
  };

  // 💬 COMMENT
  const addComment = async (id, oldComments) => {
    await updateDoc(doc(db, "products", id), {
      comments: [...(oldComments || []), comment],
    });
    setComment("");
    loadProducts();
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const bg = dark ? "#121212" : "#f0f2f5";
  const card = dark ? "#1e1e1e" : "white";
  const text = dark ? "white" : "black";

  // 🔐 LOGIN UI
  if (!user) {
    return (
      <div style={{ textAlign: "center", marginTop: "100px" }}>
        <h2>🔥 GreetX</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <br /><br />

        <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
        <br /><br />

        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  return (
    <div style={{ background: bg, minHeight: "100vh", color: text }}>

      {/* NAVBAR */}
      <div style={{
        position: "sticky",
        top: 0,
        background: card,
        padding: "10px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <h3>📸 GreetX</h3>

        <input
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: "6px",
            borderRadius: "20px",
            width: "40%"
          }}
        />

        <div>
          <button onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* ADD PRODUCT */}
      <div style={{ textAlign: "center", padding: "10px" }}>
        <input placeholder="Product" value={productName} onChange={(e) => setProductName(e.target.value)} />
        <input placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} />
        <textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
        <input placeholder="Image URL" value={image} onChange={(e) => setImage(e.target.value)} />
        <br />
        <button onClick={addProduct}>Post</button>
      </div>

      {/* FEED */}
      <div style={{ maxWidth: "600px", margin: "auto", padding: "10px" }}>
        {filtered.length === 0 ? (
          <h3 style={{ textAlign: "center" }}>No items 😢</h3>
        ) : (
          filtered.map((p) => (
            <div key={p.id} style={{
              background: card,
              margin: "10px 0",
              borderRadius: "12px",
              overflow: "hidden"
            }}>
              <img src={p.image} style={{ width: "100%", height: "250px", objectFit: "cover" }} />

              <div style={{ padding: "10px" }}>
                <h4>{p.name}</h4>
                <h3>₹ {p.price}</h3>
                <p>{p.desc}</p>

                <button onClick={() => likeProduct(p.id, p.likes || 0)}>
                  ❤️ {p.likes || 0}
                </button>

                <div>
                  ⭐ {p.rating || 0}
                  <br />
                  {[1,2,3,4,5].map((r) => (
                    <button key={r} onClick={() => rateProduct(p.id, r)}>
                      {r}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    placeholder="Comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <button onClick={() => addComment(p.id, p.comments)}>
                    Send
                  </button>

                  {p.comments?.map((c, i) => (
                    <p key={i}>💬 {c}</p>
                  ))}
                </div>

                <small>{p.user}</small>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default App;