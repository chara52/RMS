import { Timestamp } from 'firebase/firestore'

/**
 * Firestore予約データの型定義
 */
export interface Reservation {
  id: string                    // FirestoreドキュメントID
  name: string                  // 予約者名
  people: string                // 人数
  time: string                  // ISO 8601形式 (例: "2024-12-25T18:00:00.000Z")
  course: string[]              // コース(配列)
  drink: string[]               // 飲み放題オプション(配列)
  info: string                  // 詳細情報・備考
  phone: string                 // 携帯電話番号 (11桁)
  seat: string                  // 席番号
  createdBy: {                  // 作成者情報
    uid: string                 // ユーザーID
    email: string               // メールアドレス
    username: string            // ユーザー名
  }
  createdAt: Date               // 作成日時
  updatedAt: Date               // 更新日時
}

/**
 * 予約作成時の入力型 (Firestore保存用)
 */
export interface CreateReservationInput {
  name: string
  people: string
  time: string
  course: string[]
  drink: string[]
  info: string
  phone: string
  seat: string
}

/**
 * 予約更新時の入力型 (すべてオプショナル)
 */
export interface UpdateReservationInput {
  name?: string
  people?: string
  time?: string
  course?: string[]
  drink?: string[]
  info?: string
  phone?: string
  seat?: string
}

/**
 * Firestoreドキュメント型 (Timestamp含む)
 */
export interface ReservationDocument {
  name: string
  people: string
  time: string
  course: string[]
  drink: string[]
  info: string
  phone: string
  seat: string
  createdBy: {
    uid: string
    email: string
    username: string
  }
  createdAt: Timestamp
  updatedAt: Timestamp
}
