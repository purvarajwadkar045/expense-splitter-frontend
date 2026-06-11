import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  // variants are 'primary', 'secondary', 'accent', 'danger', 'ghost'
  const btnClass = `btn-${variant} btn-${size} ${className} ${disabled || loading ? 'disabled' : ''}`;

  return (
    <motion.button
      type={type}
      className={btnClass}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={disabled || loading ? {} : { scale: 1.02, y: -2 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      {...props}
    >
      {loading ? (
        <div className="btn-spinner" />
      ) : (
        <>
          {Icon && <Icon size={18} />}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
