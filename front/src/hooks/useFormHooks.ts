import { useState } from "react";

// Validaciones reutilizables
export const validateEmail = (value: string) => {
    if (!value) return "El correo electrónico es obligatorio.";
    if (!/\S+@\S+\.\S+/.test(value)) return "El correo electrónico no es válido.";
    return "";
};

export const validatePassword = (value: string) => {
    if (!value) return "La contraseña es obligatoria.";
    if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres.";
    if (!/[A-Z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
        return "Debe incluir una letra mayúscula, un número y un carácter especial.";
    }
    return "";
};

export const validateConfirmPassword = (value: string, password: string) => {
    if (!value) return "Debes confirmar tu contraseña.";
    if (value !== password) return "Las contraseñas no coinciden.";
    return "";
};

export const validateName = (value: string) => {
    if (!value) return "El nombre completo es obligatorio.";
    if (value.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    return "";
};

export const validatePhone = (value: string) => {
    if (!value) return "El número de teléfono es obligatorio.";
    if (!/^\d{9}$/.test(value)) return "El número de teléfono debe tener 9 dígitos.";
    return "";
};

// Hook para campos de formulario con validación
export function useFormField<T>(
    initialValue: T,
    validate: (value: T, ...args: unknown[]) => string,
    ...validateArgs: unknown[]
) {
    const [value, setValue] = useState<T>(initialValue);
    const [error, setError] = useState<string>("");

    const onChange = (newValue: T) => {
        setValue(newValue);
        setError(validate(newValue, ...validateArgs));
    };

    return { value, setValue, error, setError, onChange };
}
