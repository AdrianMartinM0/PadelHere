import { useEffect, useRef, useState } from "react";
import emailjs from 'emailjs-com'
import { useNavigate } from "react-router-dom";

const Recover = () => {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [passcode, setPasscode] = useState("");
    const [errorMail, setErrorMail] = useState("");
    const navigate = useNavigate();
    const noRecoverElement = useRef(null);

    useEffect(() => {
        if (passcode && name) { // Solo llama a send_mail si los valores no están vacíos
            send_mail();
        }
    }, [passcode, name]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(noRecoverElement.current){
            if (email == "") {
                noRecoverElement.current.textContent = 'El correo electrónico es obligatorio.';
                return;
            } else {
                noRecoverElement.current.textContent = '';
            }
        }
        let error = false;
        fetch(`http://localhost:8000/v1/usuario/recover?email=${email}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then(response => {
                if (!response.ok)
                    error = true;
                return response.json();
            })
            .then(data => {
                if (error) {
                    throw new Error(data.detail);
                }
                console.log(data)
                setPasscode(data.passcode);
                setName(data.name);

            })
            .catch(error => console.log(error));
    };

    const send_mail = () => {
        // e.preventDefault();
        emailjs
            .send(
                "service_pp7ga5x", // Replace with your EmailJS service ID
                "template_cwfukr7", // Replace with your EmailJS template ID
                { email, name, passcode }, // Pass the email as a parameter
                "xJLGPz0Rey9u3ehvb" // Replace with your EmailJS public key
            )
            .then(
                (result) => {
                    console.log("Correo enviado:", result.text);
                    console.log(email)
                    console.log(name)
                    console.log(passcode)
                    navigate(`/verify-passcode?email=${email}`);
                },
                (error) => {
                    console.error("Error al enviar el correo:", error.text);
                }
            );
    }

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
        setErrorMail(() => (validateEmail(value)));
    };

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
                        <div className="flex items-center w-full">
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="Ingresa tu correo"
                            />
                            <span className="p-2">
                                {errorMail ? (
                                    <span className="text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-red-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </span>
                                ) : email ? (
                                    <span className="text-green-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-500 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                ) : null}
                            </span>
                        </div>
                        <p ref={noRecoverElement} id="noRecover" className=" text-red-500 m-0 text-sm"></p>
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