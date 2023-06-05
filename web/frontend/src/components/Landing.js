import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col } from 'react-bootstrap';

function Landing() {
  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundImage: 'url(/bg2.jpg)', 
      backgroundSize: '100% 100%', // This will stretch the background image to fit the full width and height of the container
      backgroundRepeat: 'no-repeat', // This prevents the image from repeating
      backgroundPosition: 'center', 
    },
    text: {
      fontSize: '5rem',
      color: 'white',
      textShadow: '2px 2px 4px #000000',
    },
  };

  return (
    <Container fluid style={styles.container}> {/* use fluid Container to span the full width */}
      <Row>
        <Col className="text-center">
          <h1 style={styles.text}>Welcome to OUTSIDERS</h1>
        </Col>
      </Row>
    </Container>
  );
}

export default Landing;
