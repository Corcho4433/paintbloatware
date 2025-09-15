import { useMutation } from "@tanstack/react-query";
import { Formik, Field, Form } from "formik";
import { useState } from "react";
import { LoginUserRequest, RegisterUserRequest, LoginUserResponse, RegisterUserResponse } from "../types/requests";
import { serverPath } from "../utils/servers";
import { useNavigate } from "react-router-dom";
import { useAuthStore, User } from "../store/useAuthStore";
import PaintSidebar from "../components/paintsidebar";


const RegisterPage = () => {
  const [isRegistering, setRegisteringState] = useState(false);

  return (
    <div className="flex overflow-y-hidden">
      <PaintSidebar />
    <section className="flex-1 ml-0 min-h-screen w-full h-full bg-gray-300 dark:bg-gray-900 flex items-center justify-center px-6 flex-col space-y-4">
      <div className="w-1/3 min-w-[300px] bg-white rounded-lg shadow dark:border xl:p-0 dark:bg-gray-800 dark:border-gray-700">
        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
            {isRegistering ? "Register" : "Login"}
          </h1>
          {isRegistering ? (
            <RegisterForm></RegisterForm>
          ) : (
            <LoginForm></LoginForm>
          )}
          <a onClick={() => setRegisteringState(!isRegistering)} className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline cursor-pointer"> {isRegistering ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"} </a>
        </div>
      </div>
    </section>
    </div>
  );
};

export default RegisterPage;

const RegisterForm = () => {
  const registerMutation = useMutation({
    mutationFn: async (newUser: RegisterUserRequest) => {
      const response = await fetch(serverPath + "/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        throw new Error("Registration failed");
      }
      const responseJSON = await response.json();
      return responseJSON as { data: string; success: boolean };
    },
  });
  const navigate = useNavigate();
  return (
    <Formik
      initialValues={{ name: "", email: "", password: "" }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const response = await registerMutation.mutateAsync(values);
          if (response.success) {
            navigate("/login");
          }
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
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your name
            </label>
            <Field
              id="name"
              name="name"
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Lisandro"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="paint@mail.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <Field
              id="password"
              name="password"
              type="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </Form>
      )}
    </Formik>
  );
};

const LoginForm = () => {
  const setUser = useAuthStore((state) => state.setUser);
  const LoginMutation = useMutation({
    mutationFn: async (loginUser: LoginUserRequest) => {
      const response = await fetch(serverPath + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginUser),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      return response.json();
    },
  });
  const navigate = useNavigate();
  return (
    <Formik
      initialValues={{ email: "", password: "" }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const response = await LoginMutation.mutateAsync(values);
          console.log("Full response:", response);

          if (!response.success) {
            throw new Error("Login failed");
          }

          // Create user object directly from response
          const user: User = {
            id: response.id,
            name: response.name,
            email: response.email
          };

          setUser(user);
          navigate("/");
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
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Your email
            </label>
            <Field
              id="email"
              name="email"
              type="email"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="paint@mail.com"
              required
            />
          </div>


          <div>
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Password
            </label>
            <Field
              id="password"
              name="password"
              type="password"
              className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            {isSubmitting ? "Submitting..." : "Login"}
          </button>
        </Form>
      )}
    </Formik>
  );
};
