import { useState } from "react"

function useRequest() {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(null)
    const [error, setError] = useState(null)

    async function sendRequest(requestCallbackFn) {
        try {
            setLoading(true)
            const server_response = await requestCallbackFn()
            setResponse(server_response)
        }
        catch (error) {
            setError(error.message)
        }
        finally {
            setLoading(false)
        }
    }

    return { sendRequest, loading, response, error }
}

export default useRequest
