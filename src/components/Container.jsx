function Container({ className = '', ...props }) {
  return <div className={`mx-none w-full px-6 ${className}`.trim()} {...props} />
}

export default Container
