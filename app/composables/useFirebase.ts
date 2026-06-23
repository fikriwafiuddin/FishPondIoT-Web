/**
 * Firebase Composables
 * FishPondIoT Web App
 *
 * Client-side only Firebase operations
 */

import { ref, computed, onMounted, onUnmounted, type Ref } from "vue"
import type {
  MonitoringData,
  LampMode,
  PumpMode,
  FeedingSchedule,
  TemperatureStatus,
} from "../types"

// Firebase module cache (client-side only)
let firebaseModule: any = null
let database: any = null

// Load Firebase dynamically (client-side only)
const loadFirebase = async () => {
  if (import.meta.server) return null

  if (firebaseModule) {
    console.log('[loadFirebase] Using cached Firebase module')
    return firebaseModule
  }

  try {
    console.log('[loadFirebase] Loading Firebase modules...')
    const firebase = await import("firebase/app")
    const { getDatabase, ref, onValue, set, get } =
      await import("firebase/database")

    // Get Firebase config from environment variables
    const config = useRuntimeConfig()
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      databaseURL: config.public.firebaseDatabaseURL,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId,
    }

    console.log('[loadFirebase] Firebase config:', firebaseConfig)
    const app = firebase.initializeApp(firebaseConfig)
    database = getDatabase(app)

    console.log('[loadFirebase] Firebase initialized successfully')
    firebaseModule = { ref, onValue, set, get }
    return firebaseModule
  } catch (e) {
    console.error("Failed to load Firebase:", e)
    return null
  }
}

/**
 * useMonitoringData - Composable for real-time monitoring data
 */
export function useMonitoringData() {
  const data: Ref<MonitoringData | null> = ref(null)
  const loading: Ref<boolean> = ref(true)
  const error: Ref<Error | null> = ref(null)

  let unsubscribe: (() => void) | null = null

  onMounted(async () => {
    if (import.meta.server) return

    try {
      const fb = await loadFirebase()
      if (!fb) {
        loading.value = false
        return
      }

      const reference = fb.ref(database, "monitoring/latest")

      unsubscribe = fb.onValue(
        reference,
        (snapshot: any) => {
          if (snapshot.exists()) {
            console.log(snapshot.val())
            data.value = snapshot.val()
          } else {
            data.value = null
          }
          loading.value = false
        },
        (err: Error) => {
          error.value = err
          loading.value = false
          console.error("Firebase monitoring error:", err)
        },
      )
    } catch (e) {
      error.value = e as Error
      loading.value = false
      console.error("Firebase error:", e)
    }
  })

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    data,
    loading,
    error,
    isDeviceOnline: computed(() => {
      if (!data.value) return false
      return data.value.device_id && data.value.device_id !== "-"
    }),
  }
}

/**
 * useLampControl - Composable for lamp control
 */
export function useLampControl() {
  const loading: Ref<boolean> = ref(false)
  const error: Ref<Error | null> = ref(null)

  const setLampMode = async (mode: LampMode): Promise<void> => {
    if (import.meta.server) return

    console.log('[useLampControl] Setting lamp mode to:', mode)
    loading.value = true
    error.value = null

    try {
      const fb = await loadFirebase()
      if (!fb) throw new Error("Firebase not available")

      console.log('[useLampControl] Firebase loaded, writing to database...')
      await Promise.all([
        fb.set(fb.ref(database, "controls/lamp/mode"), mode),
        fb.set(fb.ref(database, "ponds/pond_01/controls/lamp/mode"), mode),
      ])
      console.log('[useLampControl] Successfully wrote lamp mode:', mode)
    } catch (e) {
      console.error('[useLampControl] Error:', e)
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const getLampMode = async (): Promise<LampMode | null> => {
    if (import.meta.server) return null

    try {
      const fb = await loadFirebase()
      if (!fb) return null

      const snapshot = await fb.get(fb.ref(database, "controls/lamp/mode"))
      return snapshot.val() as LampMode
    } catch (e) {
      console.error("Error getting lamp mode:", e)
      return null
    }
  }

  return {
    setLampMode,
    getLampMode,
    loading,
    error,
  }
}

/**
 * usePumpControl - Composable for pump control
 */
export function usePumpControl() {
  const loading: Ref<boolean> = ref(false)
  const error: Ref<Error | null> = ref(null)

  const setPumpMode = async (mode: PumpMode): Promise<void> => {
    if (import.meta.server) return

    console.log('[usePumpControl] Setting pump mode to:', mode)
    loading.value = true
    error.value = null

    try {
      const fb = await loadFirebase()
      if (!fb) throw new Error("Firebase not available")

      console.log('[usePumpControl] Firebase loaded, writing to database...')
      await Promise.all([
        fb.set(fb.ref(database, "controls/pump/mode"), mode),
        fb.set(fb.ref(database, "ponds/pond_01/controls/pump/mode"), mode),
      ])
      console.log('[usePumpControl] Successfully wrote pump mode:', mode)
    } catch (e) {
      console.error('[usePumpControl] Error:', e)
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  const getPumpMode = async (): Promise<PumpMode | null> => {
    if (import.meta.server) return null

    try {
      const fb = await loadFirebase()
      if (!fb) return null

      const snapshot = await fb.get(fb.ref(database, "controls/pump/mode"))
      return snapshot.val() as PumpMode
    } catch (e) {
      console.error("Error getting pump mode:", e)
      return null
    }
  }

  return {
    setPumpMode,
    getPumpMode,
    loading,
    error,
  }
}

/**
 * useManualFeeding - Composable for manual feeding control
 */
export function useManualFeeding() {
  const loading: Ref<boolean> = ref(false)
  const error: Ref<Error | null> = ref(null)

  const triggerFeeding = async (): Promise<void> => {
    if (import.meta.server) return

    loading.value = true
    error.value = null

    try {
      const fb = await loadFirebase()
      if (!fb) throw new Error("Firebase not available")

      await Promise.all([
        fb.set(fb.ref(database, "controls/manual_feeding/trigger"), true),
        fb.set(
          fb.ref(database, "ponds/pond_01/controls/manual_feeding/trigger"),
          true,
        ),
      ])
    } catch (e) {
      error.value = e as Error
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    triggerFeeding,
    loading,
    error,
  }
}

/**
 * useFeedingSchedule - Composable for feeding schedule management
 */
export function useFeedingSchedule() {
  const data: Ref<FeedingSchedule | null> = ref({
    schedule_1: "07:00",
    schedule_2: "17:00",
  })
  const loading: Ref<boolean> = ref(true)
  const error: Ref<Error | null> = ref(null)

  let unsubscribe: (() => void) | null = null

  onMounted(async () => {
    if (import.meta.server) return

    try {
      const fb = await loadFirebase()
      if (!fb) {
        loading.value = false
        return
      }

      const reference = fb.ref(database, "schedules/feeding_time")

      unsubscribe = fb.onValue(
        reference,
        (snapshot: any) => {
          if (snapshot.exists()) {
            data.value = snapshot.val()
          } else {
            data.value = {
              schedule_1: "07:00",
              schedule_2: "17:00",
            }
          }
          loading.value = false
        },
        (err: Error) => {
          error.value = err
          loading.value = false
          console.error("Firebase schedule error:", err)
        },
      )
    } catch (e) {
      error.value = e as Error
      loading.value = false
      console.error("Firebase error:", e)
    }
  })

  const updateSchedule = async (
    scheduleKey: "schedule_1" | "schedule_2",
    time: string,
  ): Promise<void> => {
    if (import.meta.server) return

    try {
      const fb = await loadFirebase()
      if (!fb) throw new Error("Firebase not available")

      await fb.set(
        fb.ref(database, `schedules/feeding_time/${scheduleKey}`),
        time,
      )
    } catch (e) {
      error.value = e as Error
      throw e
    }
  }

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe()
    }
  })

  return {
    data,
    loading,
    error,
    updateSchedule,
  }
}

/**
 * Utility function to get temperature status
 */
export function getTemperatureStatus(temp: number): TemperatureStatus {
  if (temp <= 0) return "NO DATA"
  if (temp < 25) return "COLD"
  if (temp > 32) return "HOT"
  return "NORMAL"
}

/**
 * Computed helper for temperature status with color coding
 */
export function useTemperatureStatus(temp: Ref<number>) {
  const status = computed<TemperatureStatus>(() => {
    return getTemperatureStatus(temp.value)
  })

  const statusColor = computed<string>(() => {
    switch (status.value) {
      case "COLD":
        return "text-blue-500"
      case "NORMAL":
        return "text-green-500"
      case "HOT":
        return "text-red-500"
      default:
        return "text-gray-400"
    }
  })

  const statusBgColor = computed<string>(() => {
    switch (status.value) {
      case "COLD":
        return "bg-blue-100 dark:bg-blue-900"
      case "NORMAL":
        return "bg-green-100 dark:bg-green-900"
      case "HOT":
        return "bg-red-100 dark:bg-red-900"
      default:
        return "bg-gray-100 dark:bg-gray-900"
    }
  })

  return {
    status,
    statusColor,
    statusBgColor,
  }
}
