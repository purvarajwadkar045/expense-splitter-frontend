import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

const InputField = ({
  label,
  name,
  type = 'text',
  icon: Icon,
  register,
  errors,
  placeholder,
  ...rest
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
        </label>
      )}

      <div className="input-wrapper">
        {Icon && (
          <div className="input-icon-left">
            <Icon size={20} />
          </div>
        )}

        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          placeholder={placeholder}
          {...(register ? register(name) : {})}
          {...rest}
          className={`auth-input ${errors?.[name] ? 'error' : ''} ${
            Icon ? 'with-icon' : ''
          }`}
        />

        {isPassword && (
          <motion.button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {showPassword ? (
              <MdVisibilityOff size={20} />
            ) : (
              <MdVisibility size={20} />
            )}
          </motion.button>
        )}
      </div>

      {errors?.[name] && (
        <p className="error-text">
          {errors[name].message}
        </p>
      )}
    </div>
  );
};

export default InputField;