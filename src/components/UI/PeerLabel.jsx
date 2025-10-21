import React from 'react'

export default function PeerLabel({checked, value, onChange, label, tooltip=false}) {
    return (
        <label className="cursor-pointer relative inline-flex items-center text-xs mt-0 group select-none">
            <input
                type="checkbox"
                className="checkbox-btn peer"
                value={value}
                checked={checked}
                onChange={onChange}
            />
            <span className="select-none pointer-events-none checkbox-label peer-checked:bg-blue-500 peer-checked:text-white peer-checked:ring-blue-500 relative z-2">
                {label}
            </span>

        
            {tooltip && <span className="absolute left-1/2 -top-6 -translate-x-1/2 w-max max-w-xs bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none transition-opacity duration-200 group-hover:opacity-100 z-6">
                {Object.values(tooltip).map((item, idx) => (
                    item.value && <div key={idx}>
                        <span className="font-bold ">{item.label}:</span> {item.value}
                    </div>
                ))}
            </span>}
        </label>
    );
}
