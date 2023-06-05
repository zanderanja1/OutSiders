import { useContext, useState } from 'react';
import { UserContext } from '../userContext';
import { Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';

function Login(){
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const userContext = useContext(UserContext); 

    async function Login(e){
        e.preventDefault();
        const res = await fetch("http://localhost:3001/users/login", {
            method: "POST",
            credentials: "include",
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        const data = await res.json();
        if(data._id !== undefined){
            userContext.setUserContext(data);
        } else {
            setUsername("");
            setPassword("");
            setError("Invalid username or password");
        }
    }

    return (
       <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-body">
                            {userContext.user ? <Navigate replace to="/" /> : ""}
                            <form onSubmit={Login}>
                                <div className="mb-3">
                                    <label htmlFor="username" className="form-label">Username</label>
                                    <input type="text" className="form-control" id="username" placeholder="Username"
                                        value={username} onChange={(e) => (setUsername(e.target.value))} />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="password" className="form-label">Password</label>
                                    <input type="password" className="form-control" id="password" placeholder="Password"
                                        value={password} onChange={(e) => (setPassword(e.target.value))} />
                                </div>
                                <button type="submit" className="btn btn-primary">Log in</button>
                            </form>
                            {error && <div className="mt-3 alert alert-danger">{error}</div>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;