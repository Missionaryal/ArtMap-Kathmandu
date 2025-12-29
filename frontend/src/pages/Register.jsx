export default function Register() {
  return (
    <div style={styles.container}>
      <h1>Register</h1>
      <input placeholder="Name" />
      <input placeholder="Email" />
      <input type="password" placeholder="Password" />
      <button>Create Account</button>
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
