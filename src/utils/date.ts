export type DDayStatus = {
  text: string;
  type: 'urgent' | 'warning' | 'normal' | 'ended' | 'always';
};

/**
 * 마감일 문자열을 분석하여 D-Day 뱃지 정보 반환
 * 예: '2026-08-25', '2026.08.30', '상시', '미정' 등
 */
export function getDDayBadge(deadlineStr?: string | null): DDayStatus {
  if (!deadlineStr || deadlineStr.trim() === '' || deadlineStr.includes('상시') || deadlineStr.includes('연중')) {
    return { text: '상시모집', type: 'always' };
  }

  if (deadlineStr.includes('마감') || deadlineStr.includes('종료')) {
    return { text: '마감', type: 'ended' };
  }

  // 날짜 형식 추출 (YYYY-MM-DD 또는 YYYY.MM.DD 또는 YYYYMMDD)
  const dateMatch = deadlineStr.match(/(\d{4})[-./년\s]+(\d{1,2})[-./월\s]+(\d{1,2})/);
  if (!dateMatch) {
    // 날짜 형식이 아니면 텍스트 길이 제한 후 표시
    return { text: deadlineStr.length > 8 ? '일정확인' : deadlineStr, type: 'normal' };
  }

  const year = parseInt(dateMatch[1], 10);
  const month = parseInt(dateMatch[2], 10) - 1;
  const day = parseInt(dateMatch[3], 10);

  const targetDate = new Date(year, month, day, 23, 59, 59);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: '마감됨', type: 'ended' };
  } else if (diffDays === 0) {
    return { text: 'D-Day 오늘마감', type: 'urgent' };
  } else if (diffDays <= 3) {
    return { text: `D-${diffDays} 마감임박`, type: 'urgent' };
  } else if (diffDays <= 7) {
    return { text: `D-${diffDays}`, type: 'warning' };
  } else if (diffDays <= 30) {
    return { text: `D-${diffDays}`, type: 'normal' };
  } else {
    return { text: `D-${diffDays}`, type: 'normal' };
  }
}
