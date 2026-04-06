import { useState } from "react";

function Login() {
  const [email, setEmail] = useState("");

  const handleLogin = () => {
    if (!email.endsWith("@psnacet.edu.in")) {
      alert("Use college email only!");
      return;
    }

    alert("Login success (temporary)");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>

      <input
        type="email"
        placeholder="Enter college email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ padding: "10px", width: "250px" }}
      />

      <br /><br />

      <button onClick={handleLogin} style={{ padding: "10px 20px" }}>
        Login
      </button>

      {/* 👇 Founder name */}
      <p style={{ marginTop: "20px", fontSize: "13px", opacity: 0.7 }}>
        🚀 Founder: SARANKUMAR P
      </p>
    </div>
  );
}

export default Login;