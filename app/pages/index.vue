<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:to-gray-800">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">FishPond IoT</h1>
          </div>
          <ClientOnly>
            <div class="flex items-center gap-2">
              <span class="text-sm text-gray-600 dark:text-gray-300">Status:</span>
              <span
                class="px-3 py-1 rounded-full text-sm font-medium"
                :class="isOnline ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'"
              >
                {{ isOnline ? 'ONLINE' : 'OFFLINE' }}
              </span>
            </div>
          </ClientOnly>
        </div>
      </div>
    </header>

    <!-- Main Content - ClientOnly for Firebase -->
    <ClientOnly>
    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Temperature Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Water Temperature</h2>
            <div class="text-3xl">🌡️</div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold" :class="tempStatusColor">
              {{ monitoring?.temperature ?? 0 }}
            </span>
            <span class="text-xl text-gray-500 dark:text-gray-400">°C</span>
          </div>
          <div class="mt-2">
            <span
              class="inline-block px-3 py-1 rounded-full text-sm font-medium"
              :class="tempStatusBgColor"
            >
              {{ tempStatus }}
            </span>
          </div>
        </div>

        <!-- Feed Level Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Feed Level</h2>
            <div class="text-3xl">🍽️</div>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="text-4xl font-bold text-amber-600 dark:text-amber-400">
              {{ monitoring?.feed_level ?? 0 }}
            </span>
            <span class="text-xl text-gray-500 dark:text-gray-400">%</span>
          </div>
          <div class="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              class="bg-amber-500 h-3 rounded-full transition-all duration-500"
              :style="{ width: `${monitoring?.feed_level ?? 0}%` }"
            ></div>
          </div>
          <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {{ feedLevelText }}
          </p>
        </div>

        <!-- Lamp Status Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transform transition hover:scale-105">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200">Lamp Status</h2>
            <div class="text-3xl">
              {{ monitoring?.lamp_status === 'ON' ? '💡' : monitoring?.lamp_status === 'OFF' ? '🌑' : '🔄' }}
            </div>
          </div>
          <div class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {{ monitoring?.lamp_status ?? 'OFF' }}
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ lampStatusText }}
          </p>
        </div>

        <!-- Lamp Control Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-1">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Lamp Control</h2>
          <div class="space-y-3">
            <button
              v-for="mode in ['ON', 'OFF', 'AUTO'] as LampMode[]"
              :key="mode"
              @click="handleLampChange(mode)"
              :disabled="lampLoading"
              class="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
              :class="currentLampMode === mode
                ? 'bg-blue-600 text-white shadow-lg scale-105'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
            >
              <span>{{ mode === 'ON' ? '💡' : mode === 'OFF' ? '🌑' : '🔄' }}</span>
              <span>{{ mode }}</span>
            </button>
          </div>
        </div>

        <!-- Manual Feeding Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-1">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Manual Feeding</h2>
          <button
            @click="handleManualFeed"
            :disabled="feedingLoading"
            class="w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 flex items-center justify-center gap-3"
            :class="feedingLoading
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:scale-105 active:scale-95'"
          >
            <span class="text-2xl">{{ feedingLoading ? '⏳' : '🐟' }}</span>
            <span>{{ feedingLoading ? 'Feeding...' : 'Feed Now' }}</span>
          </button>
          <p class="mt-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            Trigger automatic fish feeding
          </p>
        </div>

        <!-- Feeding Schedule Card -->
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:col-span-2 lg:col-span-3">
          <h2 class="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4">Feeding Schedule</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Schedule 1
              </label>
              <input
                type="time"
                :value="schedule?.schedule_1 ?? '07:00'"
                @change="handleScheduleChange('schedule_1', ($event.target as HTMLInputElement).value)"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div class="space-y-2">
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-300">
                Schedule 2
              </label>
              <input
                type="time"
                :value="schedule?.schedule_2 ?? '17:00'"
                @change="handleScheduleChange('schedule_2', ($event.target as HTMLInputElement).value)"
                class="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>
          <p class="mt-4 text-sm text-gray-500 dark:text-gray-400">
            🕐 Automatic feeding will occur at these scheduled times
          </p>
        </div>
      </div>

      <!-- Error Display -->
      <div
        v-if="monitoringError || scheduleError"
        class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
      >
        <div class="flex items-center gap-2 text-red-800 dark:text-red-200">
          <span class="text-xl">⚠️</span>
          <p class="font-medium">Connection Error</p>
        </div>
        <p class="mt-1 text-sm text-red-600 dark:text-red-300">
          Unable to connect to Firebase. Please check your internet connection.
        </p>
      </div>

      <!-- Loading State -->
      <div
        v-if="monitoringLoading || scheduleLoading"
        class="mt-6 text-center text-gray-500 dark:text-gray-400"
      >
        <p>Loading data from Firebase...</p>
      </div>
    </main>
    </ClientOnly>

    <!-- Footer -->
    <footer class="mt-auto py-6 text-center text-sm text-gray-500 dark:text-gray-400">
      <p>FishPondIoT Web Dashboard &copy; 2026</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LampMode } from '../types'
import { useMonitoringData, useLampControl, useManualFeeding, useFeedingSchedule, getTemperatureStatus } from '../composables/useFirebase'

// Use composables
const { data: monitoring, loading: monitoringLoading, error: monitoringError, isDeviceOnline } = useMonitoringData()
const { setLampMode, loading: lampLoading, error: lampError } = useLampControl()
const { triggerFeeding, loading: feedingLoading } = useManualFeeding()
const { data: schedule, loading: scheduleLoading, error: scheduleError, updateSchedule } = useFeedingSchedule()

// Computed properties
const isOnline = computed(() => isDeviceOnline.value)

const tempStatus = computed(() => {
  const temp = monitoring.value?.temperature ?? 0
  return getTemperatureStatus(temp)
})

const tempStatusColor = computed(() => {
  switch (tempStatus.value) {
    case 'COLD':
      return 'text-blue-600 dark:text-blue-400'
    case 'NORMAL':
      return 'text-green-600 dark:text-green-400'
    case 'HOT':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-400'
  }
})

const tempStatusBgColor = computed(() => {
  switch (tempStatus.value) {
    case 'COLD':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    case 'NORMAL':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    case 'HOT':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }
})

const feedLevelText = computed(() => {
  const level = monitoring.value?.feed_level ?? 0
  if (level === 0) return 'Empty - Need to refill!'
  if (level < 25) return 'Low - Refill soon'
  if (level < 50) return 'Less than half'
  if (level < 75) return 'More than half'
  return 'Full'
})

const lampStatusText = computed(() => {
  const status = monitoring.value?.lamp_status
  switch (status) {
    case 'ON':
      return 'Lamp is continuously on'
    case 'OFF':
      return 'Lamp is off'
    case 'AUTO':
      return 'Automatic mode (sensor/schedule)'
    default:
      return 'Unknown status'
  }
})

const currentLampMode = computed(() => {
  // Use the lamp mode from controls if available, otherwise from monitoring
  return monitoring.value?.lamp_status as LampMode ?? 'OFF'
})

// Event handlers
const handleLampChange = async (mode: LampMode) => {
  try {
    await setLampMode(mode)
  } catch (error) {
    console.error('Failed to change lamp mode:', error)
  }
}

const handleManualFeed = async () => {
  try {
    await triggerFeeding()
  } catch (error) {
    console.error('Failed to trigger feeding:', error)
  }
}

const handleScheduleChange = async (scheduleKey: 'schedule_1' | 'schedule_2', time: string) => {
  try {
    await updateSchedule(scheduleKey, time)
  } catch (error) {
    console.error('Failed to update schedule:', error)
  }
}
</script>
