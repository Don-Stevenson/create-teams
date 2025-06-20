'use client'

import { useState } from 'react'
import {
  forceClearAuth,
  getAuthLogs,
  clearAuthLogs,
} from '../../../utils/FEapi'

export default function DebugPage() {
  const [logs, setLogs] = useState([])
  const [backendStatus, setBackendStatus] = useState('')
  const [cookieStatus, setCookieStatus] = useState('')

  const checkBackend = async () => {
    try {
      const response = await fetch(
        'https://loons-team-balancer.onrender.com/api/test-auth',
        {
          credentials: 'include',
        }
      )
      const data = await response.json()
      setBackendStatus(JSON.stringify(data, null, 2))
    } catch (error) {
      setBackendStatus(`Error: ${error.message}`)
    }
  }

  const clearAllAuth = async () => {
    try {
      await forceClearAuth()
      // Clear all cookies manually
      document.cookie.split(';').forEach(function (c) {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
      })
      setCookieStatus('All auth cleared and cookies removed')
    } catch (error) {
      setCookieStatus(`Error: ${error.message}`)
    }
  }

  const showLogs = () => {
    setLogs(getAuthLogs())
  }

  const clearLogs = () => {
    clearAuthLogs()
    setLogs([])
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Authentication Debug</h1>

      {/* <div className="space-y-4">
        <div>
          <button
            onClick={checkBackend}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Check Backend Status
          </button>
          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  'https://loons-team-balancer.onrender.com/api/debug-cookies',
                  {
                    credentials: 'include',
                  }
                )
                const data = await response.json()
                setBackendStatus(JSON.stringify(data, null, 2))
              } catch (error) {
                setBackendStatus(`Error: ${error.message}`)
              }
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded"
          >
            Check Cookies
          </button>
          {backendStatus && (
            <pre className="bg-gray-100 p-2 mt-2 text-sm overflow-auto">
              {backendStatus}
            </pre>
          )}
        </div>

        <div>
          <button
            onClick={clearAllAuth}
            className="bg-red-500 text-white px-4 py-2 rounded mr-2"
          >
            Clear All Auth & Cookies
          </button>
          {cookieStatus && <p className="mt-2 text-sm">{cookieStatus}</p>}
        </div>

        <div>
          <button
            onClick={showLogs}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Show Auth Logs
          </button>
          <button
            onClick={clearLogs}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Clear Logs
          </button>
        </div>

        {logs.length > 0 && (
          <div>
            <h3 className="font-bold">Auth Logs:</h3>
            <div className="bg-gray-100 p-2 text-sm max-h-96 overflow-auto">
              {logs.map((log, index) => (
                <div key={index} className="border-b py-1">
                  <div className="font-semibold">{log.timestamp}</div>
                  <div>{log.message}</div>
                  {log.data && (
                    <pre className="text-xs">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="font-bold">Current Environment:</h3>
          <pre className="bg-gray-100 p-2 text-sm">
            API URL:{' '}
            {'/api'}
            {'\n'}Environment: {process.env.NODE_ENV}
          </pre>
        </div>
      </div> */}
    </div>
  )
}
