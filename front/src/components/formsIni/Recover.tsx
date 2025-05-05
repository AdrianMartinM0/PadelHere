import { useState } from "react";
import emailjs from 'emailjs-com'
import { useNavigate } from "react-router-dom";

const Recover = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [passcode, setPasscode] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetch(`http://localhost:8000/v1/usuario/recover?email=${email}`, {
            method: "GET",
            headers: {
            "Content-Type": "application/json",
            },
        })
        .then(response => {
            if (!response.ok) {
            throw new Error("Error en la solicitud");
            }
            return response.json();
        })
        .then(data => {
            setPasscode(data['passcode']);
            setName(data['name'])
            send_mail();
        })
        .catch(error => console.error("Error:", error));
    };

    const send_mail = () => {
            // e.preventDefault();
            emailjs
                .send(
                "service_pp7ga5x", // Replace with your EmailJS service ID
                "template_pp03ntu", // Replace with your EmailJS template ID
                { email, name, passcode }, // Pass the email as a parameter
                "xJLGPz0Rey9u3ehvb" // Replace with your EmailJS public key
                )
                .then(
                (result) => {
                    console.log("Correo enviado:", result.text);
                    navigate(`/verify-passcode?email=${email}`);
                },
                (error) => {
                    console.error("Error al enviar el correo:", error.text);
                }
                );
    }

    return (
        <div className="flex items-center justify-center absolute inset-0 bg-[#0003] px-4 sm:px-0">
            <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
            <h2 className="mb-6 text-2xl font-bold text-center text-gray-800">
                Recuperar Contraseña
            </h2>
            <form onSubmit={handleSubmit} >
                <div className="mb-4">
                <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-700"
                >
                    Correo Electrónico
                </label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setEmail(newValue);
                    }}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ingresa tu correo"
                />
                </div>
                <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                Enviar
                </button>
            </form>
            </div>
        </div>
    );
};

export default Recover;