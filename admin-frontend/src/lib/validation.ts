export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Email validation
export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return "Email is required";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email format (example@domain.com)";
  }

  return null;
};

// Password validation
export const validatePassword = (password: string): string | null => {
  if (!password.trim()) {
    return "Password is required";
  }

  if (password.length < 7) {
    return "Password must be at least 7 characters long";
  }

  if (password.length > 30) {
    return "Password must not exceed 30 characters";
  }

  return null;
};

// Confirm password validation
export const validateConfirmPassword = (
  password: string,
  confirmPassword: string
): string | null => {
  if (!confirmPassword.trim()) {
    return "Please confirm your password";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};

// Full name validation
export const validateFullName = (name: string): string | null => {
  if (!name.trim()) {
    return "Full name is required";
  }

  if (name.trim().length < 2) {
    return "Full name must be at least 2 characters long";
  }

  return null;
};

// Form validation helper
export const validateForm = (
  data: Record<string, string>
): ValidationResult => {
  const errors: ValidationError[] = [];

  // Validate email if present
  if (data.email) {
    const emailError = validateEmail(data.email);
    if (emailError) {
      errors.push({ field: "email", message: emailError });
    }
  }

  // Validate password if present
  if (data.password) {
    const passwordError = validatePassword(data.password);
    if (passwordError) {
      errors.push({ field: "password", message: passwordError });
    }
  }

  // Validate confirm password if present
  if (data.confirmPassword && data.password) {
    const confirmPasswordError = validateConfirmPassword(
      data.password,
      data.confirmPassword
    );
    if (confirmPasswordError) {
      errors.push({ field: "confirmPassword", message: confirmPasswordError });
    }
  }

  // Validate full name if present
  if (data.name) {
    const nameError = validateFullName(data.name);
    if (nameError) {
      errors.push({ field: "name", message: nameError });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};




