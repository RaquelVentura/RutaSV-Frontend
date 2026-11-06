import { toast } from 'sonner'
import { getErrorMessage } from './errors.js'

export const notify = {
  success(message) {
    return toast.success(message)
  },
  error(message) {
    return toast.error(message)
  },
  apiError(error) {
    return toast.error(getErrorMessage(error))
  },
}
