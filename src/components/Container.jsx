function Container({ className = '', ...props }) {
  return <div className={`mx-auto w-full max-w-6xl px-6 ${className}`.trim()} {...props} />
}

export default Container
