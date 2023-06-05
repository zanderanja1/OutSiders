import { useContext } from "react";
import { UserContext } from "../userContext";
import { Link } from "react-router-dom";
import { Navbar, Nav, NavDropdown } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function Header(props) {
    const { user } = useContext(UserContext);

    return (
        <Navbar bg="light" expand="lg">
            <Navbar.Brand as={Link} to="/">{props.title}</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="mr-auto">
                    {user ?
                        <>
                            <Nav.Link as={Link} to="/attractions">Attractions</Nav.Link>
                            <Nav.Link as={Link} to="/graphs">Graphs</Nav.Link>
                            <Nav.Link as={Link} to="/map">Map</Nav.Link>
                            <Nav.Link as={Link} to="/logout">Logout</Nav.Link>
                        </>
                        :
                        <>
                            <Nav.Link as={Link} to="/login">Login</Nav.Link>
                            <Nav.Link as={Link} to="/register">Register</Nav.Link>
                        </>
                    }
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default Header;
