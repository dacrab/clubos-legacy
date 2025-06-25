interface DateInterval {
  start: Date
  end: Date
}

export function eachDayOfInterval({ start, end }: DateInterval): Date[] {
  const days: Date[] = []
  let currentDate = new Date(start)

  while (currentDate <= end) {
    days.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }

  return days
} 