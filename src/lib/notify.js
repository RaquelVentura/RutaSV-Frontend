import { toast } from 'sonner'
import { getErrorMessage } from './errors.js'

export const notify = {
  success(message, options) {
    return toast.success(message, options)
  },
  error(message, options) {
    return toast.error(message, options)
  },
  apiError(error) {
    return toast.error(getErrorMessage(error))
  },
}
