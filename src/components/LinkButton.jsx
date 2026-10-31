import { Link } from 'react-router-dom'
import { buttonClass } from './buttonStyles.js'

function LinkButton({ variant, className, ...props }) {
  return <Link className={buttonClass(variant, className)} {...props} />
}

export default LinkButton
