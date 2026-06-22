/**
 * TypeScript Type Definitions
 * FishPondIoT Web App
 *
 * Type definitions for Firebase Realtime Database data structures
 */

// Lamp mode options
export type LampMode = 'ON' | 'OFF' | 'AUTO'

// Temperature status
export type TemperatureStatus = 'NO DATA' | 'COLD' | 'NORMAL' | 'HOT'

/**
 * Monitoring Data from IoT Device (Read-Only)
 * Path: /monitoring/latest
 */
export interface MonitoringData {
  temperature: number      // Water temperature in Celsius (-5 to 50+)
  feed_level: number       // Feed level in percentage (0-100)
  lamp_status: LampMode    // Current lamp status
  device_id: string        // Device ID for online/offline detection
}

/**
 * Lamp Control Data (Write)
 * Path: /controls/lamp/mode and /ponds/pond_01/controls/lamp/mode
 */
export interface LampControl {
  mode: LampMode
}

/**
 * Manual Feeding Trigger (Write)
 * Path: /controls/manual_feeding/trigger and /ponds/pond_01/controls/manual_feeding/trigger
 */
export interface ManualFeedingTrigger {
  trigger: boolean
}

/**
 * Feeding Schedule (Read/Write)
 * Path: /schedules/feeding_time/
 */
export interface FeedingSchedule {
  schedule_1: string   // Format: "HH:mm" (e.g., "07:00")
  schedule_2: string   // Format: "HH:mm" (e.g., "17:00")
}

/**
 * Controls structure
 * Path: /controls/
 */
export interface Controls {
  lamp: {
    mode: LampMode
  }
  manual_feeding: {
    trigger: boolean
  }
}

/**
 * Pond controls structure
 * Path: /ponds/pond_01/controls/
 */
export interface PondControls {
  lamp: {
    mode: LampMode
  }
  manual_feeding: {
    trigger: boolean
  }
}

/**
 * Schedules structure
 * Path: /schedules/
 */
export interface Schedules {
  feeding_time: FeedingSchedule
}

/**
 * Monitoring structure
 * Path: /monitoring/
 */
export interface Monitoring {
  latest: MonitoringData
}

/**
 * Complete Firebase Data Structure
 * Root level structure of the Realtime Database
 */
export interface FirebaseData {
  monitoring?: Monitoring
  controls?: Controls
  schedules?: Schedules
  ponds?: {
    pond_01: {
      controls: PondControls
    }
  }
}
