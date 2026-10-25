const CONTINUOUS_KEY = 'radio-taiso:continuous'

/** 連続再生の設定を読む。未保存やストレージが使えない場合はオン */
export function loadContinuous(): boolean {
  try {
    return localStorage.getItem(CONTINUOUS_KEY) !== 'false'
  } catch {
    return true
  }
}

export function saveContinuous(value: boolean): void {
  try {
    localStorage.setItem(CONTINUOUS_KEY, String(value))
  } catch {
    // プライベートブラウズなどで保存できなくても動作は続ける
  }
}
