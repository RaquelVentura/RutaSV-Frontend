export class ApiError extends Error {
  constructor(status, problem = {}) {
    super(problem.detail || problem.title || `Error ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.title = problem.title ?? null
    this.fieldErrors = problem.errors ?? {}
  }
}
