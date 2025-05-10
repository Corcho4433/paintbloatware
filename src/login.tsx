import React from 'react';
import { Formik } from 'formik';
import './login.css';

const Basic = () => (
  <div className="login-container">
    <h1 className="login-title">Login</h1>
    <Formik
      initialValues={{ email: '', password: '' }}
      validate={values => {
        const errors = {"email": "","password": ""};
        if (!values.email) {
          errors.email = 'Required';
        } else if (
          !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
        ) {
          errors.email = 'Invalid email address';
        }
        if (!values.password) {
          errors.password = 'Required';
        } else if (values.password.length < 6) {
          errors.password = 'Password must be at least 6 characters';
        }
        return errors;
      }}
      onSubmit={(values, { setSubmitting }) => {
        alert("papi")
        setTimeout(() => {
          alert(JSON.stringify(values, null, 2));
          setSubmitting(false);
        }, 400);
      }}
    >
      {({
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.email}
              className={errors.email && touched.email ? 'input-error' : ''}
              placeholder="Enter your email"
            />
            {errors.email && touched.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values.password}
              className={errors.password && touched.password ? 'input-error' : ''}
              placeholder="Enter your password"
            />
            {errors.password && touched.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <button 
            type="submit"
            className="submit-button"
          >
            {isSubmitting ? 'Logging in...' : 'Login'}
          </button>
        </form>
      )}
    </Formik>
  </div>
);

export default Basic;