import React from 'react';

const Avatar = ({ src, name, size = "md", className = "", onClick }) => {
    const getInitials = (fullName) => {
        if (!fullName) return "U";
        const names = fullName.trim().split(" ");
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    // Size mapping using Tailwind classes for width/height/text
    const sizeClasses = {
        sm: "w-9 h-9 text-xs",
        md: "w-12 h-12 text-sm",
        lg: "w-24 h-24 text-xl",
        xl: "w-32 h-32 text-4xl"
    };

    // Combine classes. Note: We use the `className` prop to allow overriding or adding margin/borders
    const containerClasses = `rounded-full flex items-center justify-center overflow-hidden font-bold transition-all ${sizeClasses[size] || sizeClasses.md} ${className}`;

    if (src) {
        return (
            <div className={containerClasses} onClick={onClick}>
                <img src={src} alt={name} className="w-full h-full object-cover" />
            </div>
        );
    }

    // Fallback: Gradient background with initials
    return (
        <div
            className={`${containerClasses} bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-inner select-none`}
            onClick={onClick}
        >
            {getInitials(name)}
        </div>
    );
};

export default Avatar;
