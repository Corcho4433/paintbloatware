import { useMutation } from "@tanstack/react-query";
import { Formik, Field, Form } from "formik";
import { useState } from "react";
import { LoginUserRequest, UserRegistrationRequest } from "../types/requests";
import { serverPath } from "../utils/servers";
import {   } from "flowbite-react";

const RegisterPage = () => {
  const [isRegistering, setRegisteringState] = useState(false);

  return (
    <section className="bg-gray-50 w-full dark:bg-gray-900 min-h-screen flex items-center justify-center px-6 py-8">
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
          <a onClick={() => setRegisteringState(!isRegistering)} className="font-medium text-blue-600 underline dark:text-blue-500 hover:no-underline cursor-pointer"> {isRegistering ? "No tienes una cuenta todavia?" : "Ya tienes cuenta?"} </a>
        </div>
      </div>
    </section>
  );
};

export default RegisterPage;

const RegisterForm = () => {
  const registerMutation = useMutation({
    mutationFn: async (newUser: UserRegistrationRequest) => {
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
      console.log(response.json());
      return response.json();
    },
  });
  return (
    <Formik
      initialValues={{ name: "", email: "", password: "" }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const response = await registerMutation.mutateAsync(values);
          alert(response.data);
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
  const LoginMutation = useMutation({
    mutationFn: async (loginUser: LoginUserRequest) => {
      const response = await fetch(serverPath + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginUser),
      });
      if (!response.ok) {
        throw new Error("Login failed");
      }
      const data = await response.json();
      return data.token;
    },
  });
  return (
    <Formik
      initialValues={{ mail: "", password: "" }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const response = await LoginMutation.mutateAsync(values);
          alert(response.data);
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
