import { useState, useEffect } from "react";
import { auth, db } from "./firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import { collection, addDoc, getDocs } from "firebase/firestore";

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);

  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [image, setImage] = useState("");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [page, setPage] = useState("home");

  // 🔐 Signup
  const signup = async () => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    setUser(res.user);
  };

  // 🔐 Login
  const login = async () => {
    const res = await signInWithEmailAndPassword(auth, email, password);
    setUser(res.user);
    loadProducts();
  };

  // 🚪 Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ➕ Add Product
  const addProduct = async () => {
    if (!productName || !price) return alert("Fill all fields");

    await addDoc(collection(db, "products"), {
      name: productName,
      price,
      desc,
      image,
      user: user.email,
      created: Date.now(),
    });

    setProductName("");
    setPrice("");
    setDesc("");
    setImage("");

    loadProducts();
  };

  // 📦 Load Products
  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    let list = [];
    snap.forEach((doc) => list.push(doc.data()));
    setProducts(list.reverse());
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 🔐 LOGIN PAGE
  if (!user) {
    return (
      <div style={styles.center}>
        <h2>🔥 GreetX</h2>

        <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />

        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  // 👤 PROFILE PAGE
  if (page === "profile") {
    const myProducts = products.filter((p) => p.user === user.email);

    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <button onClick={() => setPage("home")}>⬅ Back</button>
          <h3>👤 Profile</h3>
          <button onClick={logout}>Logout</button>
        </div>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <h2>{user.email}</h2>
          <p>My Products: {myProducts.length}</p>
        </div>

        <div style={styles.feed}>
          {myProducts.length === 0 && <h3>No items 😢</h3>}

          {myProducts.map((p, i) => (
            <div key={i} style={styles.card}>
              {p.image && <img src={p.image} style={styles.img} />}
              <h3>{p.name}</h3>
              <p>₹ {p.price}</p>
              <p>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 🏠 HOME PAGE
  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <h3 onClick={() => setPage("home")}>🔥 GreetX</h3>

        <input
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <div>
          <button onClick={() => setPage("profile")}>Profile</button>
          <button onClick={logout}>Logout</button>
        </div>
      </div>

      {/* ADD PRODUCT */}
      <div style={styles.form}>
        <input placeholder="Product Name" onChange={(e) => setProductName(e.target.value)} />
        <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} />
        <textarea placeholder="Description" onChange={(e) => setDesc(e.target.value)} />
        <input placeholder="Image URL" onChange={(e) => setImage(e.target.value)} />

        <button onClick={addProduct}>Post</button>
      </div>

      {/* FEED */}
      <div style={styles.feed}>
        {filtered.length === 0 && <h3>No items 😢</h3>}

        {filtered.map((p, i) => (
          <div key={i} style={styles.card}>
            {p.image && <img src={p.image} style={styles.img} />}
            <h3>{p.name}</h3>
            <p>₹ {p.price}</p>
            <p>{p.desc}</p>
            <small>👤 {p.user}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎨 STYLES
const styles = {
  container: {
    background: "#0f172a",
    minHeight: "100vh",
    color: "white",
    padding: "10px",
  },
  center: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginTop: "100px",
    gap: "10px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  feed: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))",
    gap: "15px",
  },
  card: {
    background: "#1e293b",
    padding: "10px",
    borderRadius: "10px",
  },
  img: {
    width: "100%",
    borderRadius: "10px",
  },
};