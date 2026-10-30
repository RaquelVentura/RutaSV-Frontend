function SelectField({ id, label, options, ...selectProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-ink">
        {label}
      </label>
      <select
        id={id}
        className="w-full rounded-xl border border-mist bg-canvas px-4 py-3 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
        {...selectProps}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectField
