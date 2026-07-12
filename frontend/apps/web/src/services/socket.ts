import type { CommandEnvelope, ConnectionStatus, FleetSnapshot } from './types'

type Connect = {
  send: (cmd: CommandEnvelope) => void
  disconnect: () => void
}

export type SnapshotCallback = (snap: FleetSnapshot) => void
export type StatusCallback = (status: ConnectionStatus) => void

function createMessageHandler(onSnapshot: SnapshotCallback) {
  return (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type != 'fleet_snapshot') return
      onSnapshot(data)
    } catch (error) {
      console.error('Failed to parse websocket msg:', error)
    }
  }
}

export function connect(onSnapshot: SnapshotCallback, onStatus: StatusCallback): Connect {
  let attempt = 0
  let closed = false // apps intent.. we are done, never reconnect.
  const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

  let ws: WebSocket

  function send(commandEnvelope: CommandEnvelope) {
    if (!ws || ws.readyState != WebSocket.OPEN) {
      console.warn('send() called when socket is not open; dropping message')
      return
    }
    ws.send(JSON.stringify(commandEnvelope))
  }

  async function openWs() {
    if (closed) {
      return
    }
    ws = new WebSocket('ws://localhost:8080/ws')

    ws.onopen = () => {
      attempt = 0
      onStatus('up')
      ws.onmessage = createMessageHandler(onSnapshot)
    }

    ws.onclose = async () => {
      const maxDelay = 30_000
      const baseDelay = 1_000
      const maxRetries = 5

      if (closed) {
        return
      }

      if (attempt >= maxRetries) {
        onStatus('failed')
        closed = true
        return
      }

      // 1. Exponential Backoff: baseDelay * 2^attempt
      const exponentialDelay = Math.min(maxDelay, baseDelay * Math.pow(2, attempt))

      // 2. Full Jitter: Random value between 0 and the exponential delay
      const jitterDelay = Math.random() * exponentialDelay
      ws.onerror = () => {
        console.log('An error occurred, but JavaScript cannot read the reason.')
      }
      onStatus('reconnecting')
      await wait(jitterDelay)
      attempt++
      openWs()
    }
  }

  openWs()

  const disconnect = () => {
    closed = true
    ws.onmessage = null
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000)
    }
  }
  return { send, disconnect }
}
