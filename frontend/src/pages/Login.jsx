export default function Login() {
  return (
    <div style={styles.container}>
      <h1>Login</h1>
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button>Login</button>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "60px auto",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
};
