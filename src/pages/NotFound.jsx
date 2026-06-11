import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

import '../styles/auth.css';
import '../styles/global.css';

const NotFound = () => {
  return (
    <div className="auth-page">

      <div
        className="auth-card"
        style={{
          textAlign: 'center',
          maxWidth: '700px',
        }}
      >

        <motion.h1
          initial={{
            opacity: 0,
            y: -50,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
          }}
          style={{
            fontSize: '7rem',
            fontWeight: '800',
            color: '#818cf8',
            marginBottom: '20px',
          }}
        >
          404
        </motion.h1>

        <motion.p
          initial={{
            opacity: 0,
            y: 40,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            delay: 0.2,
          }}
          style={{
            color: 'var(--text-muted)',
            fontSize: '1.3rem',
            marginBottom: '40px',
          }}
        >
          Oops! The page you're looking for doesn't exist.
        </motion.p>

        <Link to="/dashboard" style={{ display: 'inline-block' }}>
          <Button size="lg" variant="primary">
            Go to Dashboard
          </Button>
        </Link>

      </div>

    </div>
  );
};

export default NotFound;