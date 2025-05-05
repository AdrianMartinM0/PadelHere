import { useState } from "react";

const Recover = () => {
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState({ email: "" });

    const validateEmail = (value: string) => {
        if (!value) {
            return "El correo electrónico es obligatorio.";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
            return "El correo electrónico no es válido.";
        }
        return "";
    };

    const handleEmailChange = (value: string) => {
        setEmail(value);
        setErrors({ email: validateEmail(value) });
    };

    const handleRecover = async () => {
        if (errors.email || email === "") return;

        try {
            const response = await fetch("http://localhost:8000/v1/usuario/recover", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Recovery failed");
            }

            const data = await response.json();
            console.log("Recovery email sent:", data);
        } catch (error) {
            console.error("Error during recovery:", error);
        }
    };

    return (
        <div>
            {/* ...existing code for the Recover component... */}
        </div>
    );
};

export default Recover;
