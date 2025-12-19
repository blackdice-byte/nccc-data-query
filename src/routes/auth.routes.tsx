import Signin from "@/views/auth/signin";
import Signup from "@/views/auth/signup";
import ForgotPassword from "@/views/auth/forgot-password";

export const authRoutes = [
    {
        path: "signin",
        element: <Signin/>
    },
    {
        path: "signup",
        element: <Signup/>
    },
    {
        path: "forgot-password",
        element: <ForgotPassword/>
    }
]