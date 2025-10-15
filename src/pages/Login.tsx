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
          <div className="grid gap-3">
            {oauthProviders.map(p => {
              const isGoogle = p.id === 'google';
              const isGitHub = p.id === 'github';
              
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleOAuth(p.id)}
                  className={`w-full cursor-pointer text-sm font-medium rounded-lg px-4 py-3 transition-all duration-200 flex items-center justify-center gap-3 border ${
                    isGoogle 
                      ? '!bg-white hover:!bg-gray-300 !text-gray-700 !border-gray-300 hover:!border-gray-400' 
                      : '!bg-gray-900 hover:!bg-gray-700 !text-white !border-gray-600 hover:!border-gray-500'
                  }`}
                >
                  {isGoogle && (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  {isGitHub && (
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  )}
                  Continue with {p.label}
                </button>
              );
            })}
          </div>
          {/* Optional: After OAuth redirect, frontend can fetch /api/auth/me to hydrate store */}
        </Form>
      )}
    </Formik>
  );
};
