import { useState } from "react";

const SetNewPassword = () => {
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({ password: "" });

    const validatePassword = (value: string) => {
        if (!value) {
            return "La contraseña es obligatoria.";
        } else if (!/[A-Z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            return "La contraseña debe contener al menos una letra mayúscula, un número y un carácter especial.";
        }
        return "";
    };

    const handlePasswordChange = (value: string) => {
        setPassword(value);
        setErrors({ password: validatePassword(value) });
    };

    const handleSetPassword = async () => {
        if (errors.password || password === "") return;

        try {
            const response = await fetch("http://localhost:8000/v1/usuario/set-password", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                throw new Error("Password reset failed");
            }

            const data = await response.json();
            console.log("Password reset successful:", data);
        } catch (error) {
            console.error("Error during password reset:", error);
        }
    };

    return (
        <div>
            {/* ...existing code for the SetNewPassword component... */}
        </div>
    );
};

export default SetNewPassword;
