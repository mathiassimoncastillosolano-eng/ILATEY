import { useStore } from '../store/useStore'

export default function Toast() {
  const { toast, toastOn } = useStore()
  return (
    <div id="ts" className={toastOn ? 'on' : ''} role="status">
      {toast}
    </div>
  )
}
