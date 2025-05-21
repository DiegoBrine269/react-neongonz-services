import React from 'react'

export default function RadioButtonItem({onChange, checked, label}) {
  return (
      <label className="inline-flex items-center text-xs mt-0">
          <input
              type="checkbox"
              className="checkbox-btn peer"
              onChange={onChange}
              checked={checked}
          />
          <span className="checkbox-label peer-checked:bg-blue-500 peer-checked:text-white peer-checked:ring-blue-500">
              {label}
          </span>
      </label>
  );
}
