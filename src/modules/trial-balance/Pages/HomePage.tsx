import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { countryCodes } from "./CountryCodes";
import axios from "axios";

const API_URL = "http://localhost:5000/api"

const HomePage: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const [showSignUp, setShowSignUp] = useState<boolean>(false);
  const [signUpDetails, setSignUpDetails] = useState({
    name: "",
    countryCode: "+91",
    mobile: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });
  const [signUpError, setSignUpError] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // ---------------- LOGIN ----------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: email, // Backend expects 'username', we send email
        password: password,
      });
      
      const { token, user } = response.data;
      
      // Store token and user info for the session
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

    if (user.role === "admin") {
        navigate("/trial-balance/admin");
      } else {
        navigate("/trial-balance/user");
      }
    } catch (err: any) {
      setError(err.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  // ---------------- SIGN-UP ----------------
  const handleSignUpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setSignUpDetails({ ...signUpDetails, [e.target.name]: e.target.value });
  };

  const validateSignUp = () => {
    const { name, mobile, email, password, confirmPassword } = signUpDetails;   
    const nameRegex = /^[A-Za-z ]+$/;
    const mobileRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!name.trim() || !nameRegex.test(name.trim())) {
      setSignUpError("Name should only contain letters and spaces.");
      return false;
    }
    if (!mobileRegex.test(mobile.trim())) {
      setSignUpError("Mobile number should be exactly 10 digits.");
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setSignUpError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 6) {
        setSignUpError("Password must be at least 6 characters.");
        return false;
    }
    if (password !== confirmPassword) {
        setSignUpError("Passwords do not match.");
        return false;
    }


    setSignUpError("");
    return true;
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSignUp()) return;

    setLoading(true);
    setMessage("");
    setSignUpError("");


    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        name: signUpDetails.name,
        email: signUpDetails.email,
        password: signUpDetails.password,
        mobile: `${signUpDetails.countryCode}${signUpDetails.mobile}`,
        company: signUpDetails.company,
        role: signUpDetails.role,
      });

      setMessage(`✅ ${response.data.msg}`);
      setShowSignUp(false); // Close popup on success
    } catch (error:any) {
      setMessage("❌ Failed to send sign-up details. Please try again.");
      console.error("Error sending email:", error);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="homepage-container">
      <div className="login-box">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div className="input-group">
          <i className="fas fa-envelope"></i>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          </div>
            <div className="input-group">
            <i className="fas fa-lock"></i>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>{loading ? "Logging In..." : "Login"}</button>
        </form>
        <p className="sign-up-text">
          Don't have an account?
          <span onClick={() => setShowSignUp(true)}>Sign up</span>
        </p>
      </div>

      {/* {message && <p className="message">{message}</p>} */}

      {showSignUp && (
        <div className="sign-up-popup">
          <div className="sign-up-box">
            <h2>Create Your Account</h2>
            <form onSubmit={handleSignUpSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Name"
                value={signUpDetails.name}
                onChange={handleSignUpChange}
              />
              <div className="mobile-input">
                <select
                  name="countryCode"
                  value={signUpDetails.countryCode}
                  onChange={handleSignUpChange}
                >
                  {countryCodes.map(({ country, code }) => (
                    <option key={code} value={`+${code}`}>
                      {country} (+{code})
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile Number"
                  value={signUpDetails.mobile}
                  onChange={handleSignUpChange}
                />
              </div>
              <select
                name="role"
                value={signUpDetails.role}
                onChange={handleSignUpChange}
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={signUpDetails.email}
                onChange={handleSignUpChange}
              />
              <input
                type="text"
                name="company"
                placeholder="Company Name"
                value={signUpDetails.company}
                onChange={handleSignUpChange}
              />
              <input type="password" name="password" placeholder="Password (min 6 characters)" value={signUpDetails.password} onChange={handleSignUpChange} />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={signUpDetails.confirmPassword} onChange={handleSignUpChange} />

              {signUpError && <p className="error">{signUpError}</p>}
              <div className="sign-up-buttons">
              <button type="submit" disabled={loading}>
                {loading ? "Submitting..." : "Submit"}
              </button>
              <button type="button" onClick={() => setShowSignUp(false)}>
                Cancel
              </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
