import { useState } from "react";

const VerifyPasscode = () => {
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

    const handleVerify = async () => {
        if (errors.email || email === "") return;

        try {
            const response = await fetch("http://localhost:8000/v1/usuario/verify-passcode", {
                mode: "cors",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                throw new Error("Verification failed");
            }

            const data = await response.json();
            console.log("Verification successful:", data);
        } catch (error) {
            console.error("Error during verification:", error);
        }
    };

    return (
        <div>
            {/* ...existing code for the VerifyPasscode component... */}
        </div>
    );
};

export default VerifyPasscode;
