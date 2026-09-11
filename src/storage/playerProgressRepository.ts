import type { PlayerState } from '../game'

export interface PlayerProgressRepository {
  readonly load: () => PlayerState | null
  readonly save: (player: PlayerState) => boolean
}
