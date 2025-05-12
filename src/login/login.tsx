import { useMutation } from '@tanstack/react-query';
import { Formik, Field, Form } from 'formik';


type UserRegistration = {
  name: string;
  email: string;
  password: string;
}
const Basic = () => {
  const registerMutation = useMutation({
    mutationFn: async (newUser : UserRegistration) => {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      if (!response.ok) {
        throw new Error('Registration failed');
      }
      return response.json();
    }
  });

  return (
    <div>
      <h1>Sign Up</h1>
      <Formik
        initialValues={{
          name: '',
          email: '',
          password: '',
        }}
        onSubmit={async (values : UserRegistration, { setSubmitting }) => {
          try {
            const response = await registerMutation.mutateAsync(values);
            alert(response.data)
          } catch (error ) {
            if (error instanceof Error){
              alert(error.message);
            }

          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <label htmlFor="name">User Name</label>
            <Field 
              id="name" 
              name="name" 
            />

            <label htmlFor="email">Email</label>
            <Field
              id="email"
              name="email"
              type="email"
            />

            <label htmlFor="password">Password</label>
            <Field
              id="password"
              name="password"
              type="password"
            />

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default Basic;