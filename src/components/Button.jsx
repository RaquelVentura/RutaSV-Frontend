import { buttonClass } from './buttonStyles.js'

function Button({ variant, className, type = 'button', ...props }) {
  return (
    <button type={type} className={buttonClass(variant, className)} {...props} />
  )
}

export default Button
