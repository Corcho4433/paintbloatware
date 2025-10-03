import { Formik, Field, Form } from "formik";
import { useState } from "react";
import PaintSidebar from "../components/paintsidebar";
import { useRegisterMutation, useLoginMutation } from "../hooks/authorization";
import { serverPath } from "../utils/servers";


const RegisterPage = () => {
  const [isRegistering, setRegisteringState] = useState(false);

  return (
    <div className="flex overflow-y-hidden">
      <PaintSidebar />
    <section className="flex-1 ml-0 min-h-screen w-full h-full bg-gray-900 flex items-center justify-center px-6 flex-col space-y-4">
      <div className="w-1/3 min-w-[300px] bg-gray-800 rounded-lg shadow border xl:p-0 border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-white md:text-2xl">
            {isRegistering ? "Register" : "Login"}
          </h1>
          {isRegistering ? (
            <RegisterForm></RegisterForm>
          ) : (
            <LoginForm></LoginForm>
          )}
          <a onClick={() => setRegisteringState(!isRegistering)} className="font-medium text-blue-600 underlinetext-blue-500 hover:no-underline cursor-pointer"> {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"} </a>
        </div>
      </div>
    </section>
    </div>
  );
};

export default RegisterPage;

const oauthProviders = [
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

const handleOAuth = (providerId: string) => {
  const width = 500;
const height = 600;
const left = window.screenX + (window.innerWidth - width) / 2;
const top = window.screenY + (window.innerHeight - height) / 2;

window.open(
  `${serverPath}/api/auth/${providerId}`,
  "Google Login",
  `width=${width},height=${height},top=${top},left=${left}`
);
};

const RegisterForm = () => {
  const registerMutation = useRegisterMutation();
  
  return (
    <Formik
      initialValues={{ name: "", email: "", password: "" }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await registerMutation.mutateAsync(values);
        } catch (error) {
          if (error instanceof Error) {
            alert(error.message);
          }
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 md:space-y-6 text-left">
          <div>
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-white"
            >
              Your name
            </label>
            <Field
              id="name"
              name="name"
              type="text"
              className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 placeholder-gray-400"
              placeholder="Lisandro"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-white"
            >
              Your email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 placeholder-gray-400"
              placeholder="paint@mail.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-white"
            >
              Password
            </label>
            <Field
              id="password"
              name="password"
              type="password"
              className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white !bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

const LoginForm = () => {
  const loginMutation = useLoginMutation();
  
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await loginMutation.mutateAsync(values);
        } catch (error) {
          if (error instanceof Error) {
            alert(error.message);
          }
          console.error("Login error:", error);
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-4 md:space-y-6 text-left">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-white"
            >
              Your email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 placeholder-gray-400"
              placeholder="paint@mail.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-white"
            >
              Password
            </label>
            <Field
              id="password"
              name="password"
              type="password"
              className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 placeholder-gray-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white !bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            {isSubmitting ? "Submitting..." : "Login"}
          </button>
          <div className="flex items-center gap-2 pt-2">
            <div className="h-px bg-gray-600 flex-1" />
            <span className="text-gray-400 text-xs">OR</span>
            <div className="h-px bg-gray-600 flex-1" />
          </div>
          <div className="grid gap-2">
            {oauthProviders.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleOAuth(p.id)}
                className="w-full text-sm bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2 transition flex items-center justify-center gap-2"
              >
                Continue with {p.label}
              </button>
            ))}
          </div>
          {/* Optional: After OAuth redirect, frontend can fetch /api/auth/me to hydrate store */}
        </Form>
      )}
    </Formik>
  );
};
