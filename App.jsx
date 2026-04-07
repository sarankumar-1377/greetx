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

  // ✅ STRICT COLLEGE CHECK
  const isCollegeEmail = (mail) => {
    return mail.trim().toLowerCase().endsWith("@psnacet.edu.in");
  };

  // 🔐 SIGNUP
  const signup = async () => {
    try {
      if (!isCollegeEmail(email)) {
        alert("❌ Only PSNACET college mail allowed");
        return;
      }

      const res = await createUserWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      alert("Signup success ✅");

    } catch (err) {
      alert(err.message);
    }
  };

  // 🔐 LOGIN
  const login = async () => {
    try {
      if (!isCollegeEmail(email)) {
        alert("❌ Use college mail only");
        return;
      }

      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      loadProducts();

    } catch (err) {
      alert(err.message);
    }
  };

  // 🚪 LOGOUT
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ➕ ADD PRODUCT
  const addProduct = async () => {
    if (!productName || !price) {
      alert("Fill all fields");
      return;
    }

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

  // 📦 LOAD PRODUCTS
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

  // 🔐 LOGIN UI
  if (!user) {
    return (
      <div style={styles.center}>
        <h2>🔥 GreetX</h2>

        <input
          placeholder="College Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button onClick={login}>Login</button>
        <button onClick={signup}>Signup</button>
      </div>
    );
  }

  // 🏠 HOME UI
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3>🔥 GreetX</h3>

        <input
          placeholder="Search..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={logout}>Logout</button>
      </div>

      <div style={styles.form}>
        <input placeholder="Product Name" onChange={(e) => setProductName(e.target.value)} />
        <input placeholder="Price" onChange={(e) => setPrice(e.target.value)} />
        <textarea placeholder="Description" onChange={(e) => setDesc(e.target.value)} />
        <input placeholder="Image URL" onChange={(e) => setImage(e.target.value)} />

        <button onClick={addProduct}>Post</button>
      </div>

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
    marginBottom: "20px",
    gap: "10px",
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