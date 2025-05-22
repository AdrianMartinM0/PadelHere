import React, { useEffect, useState } from "react";

export default function SalirButton({ onClick }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Activa la animación después de montar el componente
    setTimeout(() => setShow(true), 10);
  }, []);

  return (
    <button
      onClick={onClick}
      className={`
        transition-opacity duration-500
        ${show ? "opacity-100" : "opacity-0"}
        // ...otras clases tailwind existentes...
      `}
    >
      Salir
    </button>
  );
}