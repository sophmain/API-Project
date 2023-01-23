import React, { useState, useEffect } from "react";
import * as sessionActions from "../../store/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";
import smallLogo from '../../images/smalllogo.png'

function LoginFormModal() {
  const dispatch = useDispatch();
  const [credential, setCredential] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);
  const { closeModal } = useModal();

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    return dispatch(sessionActions.login({ credential, password }))
      .then(closeModal)
      .catch(
        async (res) => {
          const data = await res.json();
          if (data && data.errors) setErrors(data.errors);
        }
      );
  };

  // const demoUser = useEffect(() => {
  //   const setDemo = () => {
  //   setCredential('Demo-lition')
  //   setPassword('password')
  //   setDemo()
  // }}, [])

  return (
    <>
      <div className="login-container">
        <img src={smallLogo} className="small-logo"></img>
        <h1>Log in</h1>
        <form onSubmit={handleSubmit}>
          <ul>
            {errors.map((error, idex) => (
              <li className="errors-text" key={idex}>{error}</li>
            ))}
          </ul>
          <div className="login-input">
            <label>
              <p className="email-input">
                Email or Username
              </p>
              <input
                className="input-box"
                type="text"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
              />
            </label>
            <label>
              <p className="password-input">
                Password
              </p>
              <input
                className="input-box"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
          </div>

          <button type="submit" className="login-button">Log In</button>
          <p className="login-break">- or -</p>
          <button type="demo" className="demo-button"  onClick={() => {setCredential('Demo-lition'); setPassword('password')}}>Demo User</button>
        </form>
      </div>
    </>
  );
}

export default LoginFormModal;
